import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentTransactionEntity } from './entities/payment_transaction.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EPaymentTransactionStatus } from 'src/utils/enums/tuition.enum';
import { TuitionEntity } from '../tuition/entities/tuition.entity';
import { TuitionService } from '../tuition/tuition.service';
import { UserService } from '../user/user.service';
import { CreatePaymentTransactionDto } from './dto/createPaymentTransaction.dto';
import { UpdatePaymentTransactionDto } from './dto/updatePaymentTransaction.dto';

@Injectable()
export class PaymentTransactionService {
  constructor(
    @InjectRepository(PaymentTransactionEntity)
    private readonly paymentTransactionRepository: Repository<PaymentTransactionEntity>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => TuitionService))
    private readonly tuitionService: TuitionService,
    private readonly userService: UserService,
  ) {}

  private async _validateDependencies(
    tuitionId: number,
    processedByUserId?: number,
  ): Promise<void> {
    await this.tuitionService.findOne(tuitionId);
    if (processedByUserId) {
      await this.userService.getUserById(processedByUserId);
    }
  }

  async create(
    createDto: CreatePaymentTransactionDto,
  ): Promise<PaymentTransactionEntity> {
    const {
      tuitionId,
      amountPaid,
      status = EPaymentTransactionStatus.PENDING,
      processedByUserId,
      ...rest
    } = createDto;

    await this._validateDependencies(tuitionId, processedByUserId);

    const tuition = await this.tuitionService.findOne(tuitionId);
    if (status === EPaymentTransactionStatus.SUCCESS) {
      const potentialNewAmountPaid =
        Number(tuition.amountPaid) + Number(amountPaid);
      if (
        potentialNewAmountPaid > Number(tuition.totalAmountDue) &&
        Number(tuition.totalAmountDue) > 0
      ) {
        console.warn(
          `Thanh toán này có thể khiến tổng đã đóng vượt quá tổng phải đóng cho tuition ID ${tuitionId}`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newTransaction = queryRunner.manager.create(
        PaymentTransactionEntity,
        {
          tuitionId,
          amountPaid,
          status,
          processedByUserId,
          ...rest,
        },
      );

      const savedTransaction = await queryRunner.manager.save(
        PaymentTransactionEntity,
        newTransaction,
      );

      if (savedTransaction.status === EPaymentTransactionStatus.SUCCESS) {
        await this.tuitionService.updateTuitionAfterPayment(
          tuitionId,
          Number(savedTransaction.amountPaid), // amountChange là dương
        );
        const tuitionToUpdate = await queryRunner.manager.findOne(
          TuitionEntity,
          { where: { id: tuitionId } },
        );
        if (!tuitionToUpdate)
          throw new NotFoundException(
            `Tuition with ID ${tuitionId} not found within transaction.`,
          );

        let newTuitionAmountPaid =
          Number(tuitionToUpdate.amountPaid) +
          Number(savedTransaction.amountPaid);
        if (newTuitionAmountPaid < 0) newTuitionAmountPaid = 0;

        const calculated = await this.tuitionService._calculateBalanceAndStatus(
          Number(tuitionToUpdate.totalAmountDue),
          newTuitionAmountPaid,
        );

        tuitionToUpdate.amountPaid = newTuitionAmountPaid;
        tuitionToUpdate.balance = calculated.balance;
        tuitionToUpdate.status = calculated.status;
        await queryRunner.manager.save(TuitionEntity, tuitionToUpdate);
      }

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating payment transaction:', error);
      throw new InternalServerErrorException(
        'Lỗi khi tạo giao dịch thanh toán.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByTuitionId(
    tuitionId: number,
    paginationDto: PaginationDto,
  ): Promise<{
    data: PaymentTransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.tuitionService.findOne(tuitionId); // Validate tuition exists

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.paymentTransactionRepository.findAndCount({
      where: { tuitionId },
      relations: ['processedByUser'],
      skip,
      take: limit,
      order: { paymentDate: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<PaymentTransactionEntity> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { id },
      relations: ['tuition', 'processedByUser'],
    });
    if (!transaction) {
      throw new NotFoundException(
        `Không tìm thấy giao dịch thanh toán với ID ${id}`,
      );
    }
    return transaction;
  }

  async update(
    id: number,
    updateDto: UpdatePaymentTransactionDto,
  ): Promise<PaymentTransactionEntity> {
    const transaction = await this.findOne(id); // Lấy giao dịch hiện tại
    const oldStatus = transaction.status;
    const oldAmount = Number(transaction.amountPaid); // Lưu lại số tiền cũ để tính delta

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Merge và lưu transaction
      queryRunner.manager.merge(
        PaymentTransactionEntity,
        transaction,
        updateDto,
      );
      const updatedTransaction = await queryRunner.manager.save(
        PaymentTransactionEntity,
        transaction,
      );
      const newStatus = updatedTransaction.status;

      let amountChange = 0;

      // Logic cập nhật TuitionEntity dựa trên thay đổi status
      if (oldStatus !== newStatus) {
        // Từ bất kỳ trạng thái nào -> SUCCESS
        if (
          newStatus === EPaymentTransactionStatus.SUCCESS &&
          oldStatus !== EPaymentTransactionStatus.SUCCESS
        ) {
          amountChange = oldAmount; // Số tiền được cộng vào tuition
        }
        // Từ SUCCESS -> REFUNDED
        else if (
          newStatus === EPaymentTransactionStatus.REFUNDED &&
          oldStatus === EPaymentTransactionStatus.SUCCESS
        ) {
          amountChange = -oldAmount; // Số tiền được trừ khỏi tuition
        }
        // Từ SUCCESS -> FAILED/PENDING (hoặc trạng thái khác không phải REFUNDED)
        else if (
          oldStatus === EPaymentTransactionStatus.SUCCESS &&
          (newStatus === EPaymentTransactionStatus.FAILED ||
            newStatus === EPaymentTransactionStatus.PENDING ||
            newStatus === EPaymentTransactionStatus.PROCESSING)
        ) {
          amountChange = -oldAmount; // Coi như giao dịch thành công trước đó bị hủy
        }
        // Các trường hợp chuyển đổi khác (ví dụ: PENDING -> FAILED) không ảnh hưởng trực tiếp đến amountPaid của Tuition
      }

      if (amountChange !== 0) {
        // Tải lại TuitionEntity bằng queryRunner.manager để đảm bảo tính nhất quán trong transaction
        const tuitionToUpdate = await queryRunner.manager.findOne(
          TuitionEntity,
          { where: { id: updatedTransaction.tuitionId } },
        );
        if (!tuitionToUpdate) {
          throw new NotFoundException(
            `Học phí với ID ${updatedTransaction.tuitionId} không tìm thấy trong transaction.`,
          );
        }

        let newTuitionAmountPaid =
          Number(tuitionToUpdate.amountPaid) + amountChange;
        if (newTuitionAmountPaid < 0) newTuitionAmountPaid = 0;

        const calculated = await this.tuitionService._calculateBalanceAndStatus(
          Number(tuitionToUpdate.totalAmountDue),
          newTuitionAmountPaid,
        );

        tuitionToUpdate.amountPaid = newTuitionAmountPaid;
        tuitionToUpdate.balance = calculated.balance;
        tuitionToUpdate.status = calculated.status;

        await queryRunner.manager.save(TuitionEntity, tuitionToUpdate);
      }

      await queryRunner.commitTransaction();
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Error updating payment transaction ID ${id}:`, error);
      throw new InternalServerErrorException(
        'Lỗi khi cập nhật giao dịch thanh toán.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
