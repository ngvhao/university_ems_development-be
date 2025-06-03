import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, In, Not, DataSource } from 'typeorm';
import { TuitionEntity } from './entities/tuition.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EPaymentMethod, ETuitionStatus } from 'src/utils/enums/tuition.enum';
import { StudentService } from '../student/student.service';
import { SemesterService } from '../semester/semester.service';
import { CreateTuitionDto } from './dto/createTuition.dto';
import { UpdateTuitionDto } from './dto/updateTuition.dto';
import { PaymentProcessDto } from './dto/processPayment.dto';
import { PaymentStrategyFactory } from 'src/modules/payment/payment.factory';
import { PaymentContext } from 'src/modules/payment/payment.context';
import { EnrollmentCourseEntity } from '../enrollment_course/entities/enrollment_course.entity';
import { TuitionDetailEntity } from '../tuition_detail/entities/tuition_detail.entity';
import { CreateTuitionBatchDto } from './dto/createTuitionBatch.dto';
import { PaymentTransactionService } from '../payment_transaction/payment_transaction.service';

interface GroupedEnrollments {
  [studentId: number]: EnrollmentCourseEntity[];
}

@Injectable()
export class TuitionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(TuitionEntity)
    private readonly tuitionRepository: Repository<TuitionEntity>,
    private readonly studentService: StudentService,
    private readonly semesterService: SemesterService,
    private paymentContext: PaymentContext,
    private readonly paymentFactoryInstance: PaymentStrategyFactory,
    @Inject(forwardRef(() => PaymentTransactionService))
    private readonly paymentTransactionService: PaymentTransactionService,
  ) {}

  private async _checkStudentAndSemester(
    studentId: number,
    semesterId: number,
  ): Promise<void> {
    const student = await this.studentService.getOne({
      id: studentId,
    });
    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy sinh viên với ID ${studentId}`,
      );
    }
    const semester = await this.semesterService.getOne({
      id: semesterId,
    });
    if (!semester) {
      throw new NotFoundException(`Không tìm thấy học kỳ với ID ${semesterId}`);
    }
  }
  /**
   * Tính toán balance và status dựa trên tổng số tiền phải đóng và số tiền đã thanh toán.
   * @param totalAmountDue Tổng số tiền phải đóng.
   * @param amountPaid Số tiền đã thanh toán.
   * @returns { balance: number; status: ETuitionStatus }
   */
  async _calculateBalanceAndStatus(
    totalAmountDue: number,
    amountPaid: number,
  ): Promise<{ balance: number; status: ETuitionStatus }> {
    const balance = Math.max(0, totalAmountDue - amountPaid);
    let status: ETuitionStatus;

    if (balance <= 0 && totalAmountDue > 0) {
      status = ETuitionStatus.PAID;
    } else if (amountPaid > 0 && balance > 0) {
      status = ETuitionStatus.PARTIALLY_PAID;
    } else if (amountPaid === 0 && totalAmountDue > 0) {
      status = ETuitionStatus.PENDING;
    } else {
      // totalAmountDue có thể là 0 (VD: học bổng 100%)
      status = ETuitionStatus.PAID;
    }
    // Logic cho OVERDUE cần xem xét thêm dueDate
    return { balance, status };
  }

  async processPayment(
    processPaymentDto: PaymentProcessDto,
    processByUserId: number,
  ): Promise<string> {
    const { tuitionId, paymentGateway } = processPaymentDto;

    const tuition = await this.tuitionRepository.findOne({
      where: {
        id: tuitionId,
        status: Not(
          In([
            ETuitionStatus.OVERDUE,
            ETuitionStatus.CANCELLED,
            ETuitionStatus.PAID,
          ]),
        ),
      },
      relations: {
        student: true,
      },
    });
    console.log('processPayment@@tuition:', tuition);
    if (!tuition) {
      throw new NotFoundException(
        `Không tìm thấy học phí với ID ${tuitionId} để xử lý thanh toán.`,
      );
    }
    if (
      tuition.balance > 0 &&
      Date.now() < new Date(tuition.dueDate).getTime()
    ) {
      const newPaymentTransaction = await this.paymentTransactionService.create(
        {
          tuitionId: tuition.id,
          amountPaid: tuition.balance,
          paymentMethod: EPaymentMethod.ONLINE_GATEWAY,
          processedByUserId: processByUserId,
          paymentDate: null,
          notes: paymentGateway + ' payment',
        },
      );

      const payment =
        this.paymentFactoryInstance.createPaymentStrategy(paymentGateway);
      this.paymentContext.setStrategy(payment);
      const paymentGatewayUrl = await this.paymentContext.processPayment(
        tuition.balance,
        newPaymentTransaction.id,
        {
          orderInfo: `Thanh toán học phí cho sinh viên ${tuition.student.studentCode}`,
        },
      );

      return paymentGatewayUrl;
    }
    if (Date.now() > new Date(tuition.dueDate).getTime()) {
      throw new BadRequestException(
        `Học phí của sinh viên đã quá hạn thanh toán với học phí ID: ${tuitionId}`,
      );
    }
    throw new BadRequestException(
      `Học phí của sinh viên đã được thanh toán với học phí ID: ${tuitionId}`,
    );
  }

  async create(createTuitionDto: CreateTuitionDto): Promise<TuitionEntity> {
    const {
      studentId,
      semesterId,
      totalAmountDue,
      amountPaid = 0,
      status: DtoStatus,
      ...rest
    } = createTuitionDto;

    await this._checkStudentAndSemester(studentId, semesterId);

    // Kiểm tra xem đã tồn tại bản ghi học phí cho sinh viên và học kỳ này chưa
    const existingTuition = await this.tuitionRepository.findOne({
      where: { studentId, semesterId },
    });
    if (existingTuition) {
      throw new ConflictException(
        `Học phí cho sinh viên ID ${studentId} và học kỳ ID ${semesterId} đã tồn tại.`,
      );
    }

    if (amountPaid > totalAmountDue) {
      throw new BadRequestException(
        'Số tiền đã thanh toán không thể lớn hơn tổng số tiền phải đóng.',
      );
    }

    const calculated = await this._calculateBalanceAndStatus(
      totalAmountDue,
      amountPaid,
    );

    const newTuition = this.tuitionRepository.create({
      ...rest,
      studentId,
      semesterId,
      totalAmountDue,
      amountPaid,
      balance: calculated.balance,
      status: DtoStatus !== undefined ? DtoStatus : calculated.status,
    });

    return await this.tuitionRepository.save(newTuition);
  }

  async createTuitionsForStudentBatch(
    createTuitionsBatchDto: CreateTuitionBatchDto,
  ): Promise<void> {
    const {
      semesterId,
      tuitionType,
      description,
      pricePerCreditForSemester,
      issueDate,
      dueDate,
    } = createTuitionsBatchDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log(
      `Transaction CREATED for batch tuition generation - Semester: ${semesterId}, Type: ${tuitionType}`,
    );
    try {
      const enrollmentsList = await queryRunner.manager.find(
        EnrollmentCourseEntity,
        {
          where: {
            classGroup: {
              semesterId: semesterId,
            },
          },
          relations: ['student', 'classGroup', 'classGroup.course'],
        },
      );

      if (enrollmentsList.length === 0) {
        console.log(
          'No enrollments found for this semester. Committing empty transaction.',
        );
        await queryRunner.commitTransaction();
        return;
      }

      const groupedByStudent: GroupedEnrollments = enrollmentsList.reduce(
        (acc, enrollment) => {
          const studentId = enrollment.student?.id || enrollment.studentId;

          if (!studentId) {
            console.warn(
              'Enrollment without valid studentId found:',
              enrollment.id,
            );
            return acc;
          }

          if (!acc[studentId]) {
            acc[studentId] = [];
          }
          acc[studentId].push(enrollment);
          return acc;
        },
        {} as GroupedEnrollments,
      );

      for (const studentIdStr in groupedByStudent) {
        const studentId = parseInt(studentIdStr, 10);
        const studentEnrollments = groupedByStudent[studentIdStr];

        console.log(`Processing tuition for student ID: ${studentId}`);

        let tuition = await queryRunner.manager.findOne(TuitionEntity, {
          where: {
            studentId: studentId,
            semesterId: semesterId,
            tuitionType: tuitionType,
          },
        });

        let isNewTuition = false;
        if (!tuition) {
          isNewTuition = true;
          tuition = new TuitionEntity();
          tuition.studentId = studentId;
          tuition.semesterId = semesterId;
          tuition.tuitionType = tuitionType;
          tuition.description = description;
          tuition.issueDate = new Date(issueDate);
          tuition.dueDate = new Date(dueDate);
          tuition.status = ETuitionStatus.PENDING;
          tuition.totalAmountDue = 0;
          tuition.amountPaid = 0;
          tuition.balance = 0;
          tuition = await queryRunner.manager.save(TuitionEntity, tuition);
          console.log(
            `CREATED new Tuition (ID: ${tuition.id}) for student ID: ${studentId}`,
          );
        } else {
          console.log(
            `FOUND existing Tuition (ID: ${tuition.id}) for student ID: ${studentId}`,
          );
        }

        let currentTuitionTotalAggregated = isNewTuition
          ? 0
          : tuition.totalAmountDue;

        for (const enrollment of studentEnrollments) {
          const existingTuitionDetail = await queryRunner.manager.findOne(
            TuitionDetailEntity,
            {
              where: {
                tuitionId: tuition.id,
                enrollmentId: enrollment.id,
              },
            },
          );

          if (existingTuitionDetail) {
            console.log(
              `SKIPPED: TuitionDetail for enrollment ID ${enrollment.id} already exists in Tuition ID ${tuition.id}.`,
            );
            continue;
          }

          const tuitionDetail = new TuitionDetailEntity();
          tuitionDetail.tuition = tuition;
          tuitionDetail.enrollmentId = enrollment.id;

          const course = enrollment.classGroup?.course;
          const feeForThisCourse = pricePerCreditForSemester * course?.credit;

          tuitionDetail.amount = feeForThisCourse;
          tuitionDetail.numberOfCredits = course?.credit;
          tuitionDetail.pricePerCredit = pricePerCreditForSemester;

          await queryRunner.manager.save(TuitionDetailEntity, tuitionDetail);
          console.log(
            `CREATED TuitionDetail for enrollment ID ${enrollment.id} (Tuition ID: ${tuition.id}), Amount: ${feeForThisCourse}`,
          );
          currentTuitionTotalAggregated += feeForThisCourse;
        }

        if (tuition.totalAmountDue !== currentTuitionTotalAggregated) {
          tuition.totalAmountDue = currentTuitionTotalAggregated;
          tuition.balance = tuition.totalAmountDue - tuition.amountPaid;
          await queryRunner.manager.save(TuitionEntity, tuition);
          console.log(
            `UPDATED Tuition (ID: ${tuition.id}) for student ID: ${studentId} with new totalAmountDue: ${tuition.totalAmountDue}`,
          );
        }
      }

      await queryRunner.commitTransaction();
      console.log(
        'Transaction COMMITTED successfully for batch tuition generation.',
      );
    } catch (error) {
      console.error('Transaction FAILED for batch tuition generation:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      console.log('Transaction RELEASED for batch tuition generation.');
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: TuitionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.tuitionRepository.findAndCount({
      relations: ['student', 'semester', 'details', 'paymentTransactions'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<TuitionEntity> {
    const options: FindOneOptions<TuitionEntity> = {
      where: { id },
      relations: ['student', 'semester', 'details', 'paymentTransactions'],
    };
    const tuition = await this.tuitionRepository.findOne(options);
    if (!tuition) {
      throw new NotFoundException(`Không tìm thấy học phí với ID ${id}`);
    }
    return tuition;
  }

  async update(
    id: number,
    updateTuitionDto: UpdateTuitionDto,
  ): Promise<TuitionEntity> {
    const tuition = await this.findOne(id); // Kiểm tra sự tồn tại và lấy thông tin cũ

    const {
      studentId,
      semesterId,
      totalAmountDue,
      amountPaid,
      status: DtoStatus,
      ...rest
    } = updateTuitionDto;

    if (studentId && studentId !== tuition.studentId) {
      const student = await this.studentService.getOne({ id: studentId });
      if (!student)
        throw new NotFoundException(
          `Không tìm thấy sinh viên với ID ${studentId} để cập nhật.`,
        );
    }
    if (semesterId && semesterId !== tuition.semesterId) {
      const semester = await this.semesterService.getOne({
        id: semesterId,
      });
      if (!semester)
        throw new NotFoundException(
          `Không tìm thấy học kỳ với ID ${semesterId} để cập nhật.`,
        );
    }

    // Kiểm tra xung đột nếu studentId hoặc semesterId thay đổi
    if (
      (studentId && studentId !== tuition.studentId) ||
      (semesterId && semesterId !== tuition.semesterId)
    ) {
      const newStudentId = studentId || tuition.studentId;
      const newSemesterId = semesterId || tuition.semesterId;
      if (
        newStudentId !== tuition.studentId ||
        newSemesterId !== tuition.semesterId
      ) {
        const existingTuition = await this.tuitionRepository.findOne({
          where: {
            studentId: newStudentId,
            semesterId: newSemesterId,
            id: id,
          },
        });
        if (existingTuition) {
          throw new ConflictException(
            `Học phí cho sinh viên ID ${newStudentId} và học kỳ ID ${newSemesterId} đã tồn tại.`,
          );
        }
      }
    }

    const currentTotalAmountDue =
      totalAmountDue !== undefined ? totalAmountDue : tuition.totalAmountDue;
    const currentAmountPaid =
      amountPaid !== undefined ? amountPaid : tuition.amountPaid;

    if (currentAmountPaid > currentTotalAmountDue) {
      throw new BadRequestException(
        'Số tiền đã thanh toán không thể lớn hơn tổng số tiền phải đóng.',
      );
    }

    const calculated = await this._calculateBalanceAndStatus(
      currentTotalAmountDue,
      currentAmountPaid,
    );

    // Merge các thay đổi vào tuition entity đã tìm thấy
    this.tuitionRepository.merge(tuition, {
      ...rest,
      studentId: studentId !== undefined ? studentId : tuition.studentId,
      semesterId: semesterId !== undefined ? semesterId : tuition.semesterId,
      totalAmountDue: currentTotalAmountDue,
      amountPaid: currentAmountPaid,
      balance: calculated.balance,
      status: DtoStatus !== undefined ? DtoStatus : calculated.status,
    });

    return await this.tuitionRepository.save(tuition);
  }

  async remove(id: number): Promise<void> {
    const tuition = await this.findOne(id);
    if (tuition.paymentTransactions && tuition.paymentTransactions.length > 0) {
      throw new BadRequestException(
        `Không thể xóa học phí ID ${id} do đã có giao dịch thanh toán liên quan.`,
      );
    }
    const result = await this.tuitionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy học phí với ID ${id} để xóa`);
    }
  }

  async getTuitionsByStudent(
    studentId: number,
    paginationDto: PaginationDto,
  ): Promise<{
    data: TuitionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    await this.studentService.getOne({ id: studentId });
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.tuitionRepository.findAndCount({
      where: { studentId },
      relations: ['semester'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async getTuitionsBySemester(
    semesterId: number,
    paginationDto: PaginationDto,
  ): Promise<{
    data: TuitionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const semester = await this.semesterService.getOne({ id: semesterId });
    if (!semester) {
      throw new NotFoundException(`Không tìm thấy học kỳ với ID ${semesterId}`);
    }

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.tuitionRepository.findAndCount({
      where: { semesterId },
      relations: ['student'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  /**
   * Cập nhật thông tin tài chính của một khoản học phí (totalAmountDue, balance, status).
   * Phương thức này được gọi bởi TuitionDetailService sau khi có thay đổi về tổng số tiền từ các chi tiết.
   * @param tuitionId ID của khoản học phí cần cập nhật.
   * @param newTotalAmountDue Tổng số tiền phải đóng mới, được tính từ các chi tiết học phí.
   * @returns TuitionEntity đã được cập nhật.
   */
  async updateTuitionFinancials(
    tuitionId: number,
    newTotalAmountDue: number,
  ): Promise<TuitionEntity> {
    const tuition = await this.tuitionRepository.findOne({
      where: { id: tuitionId },
    });
    if (!tuition) {
      throw new NotFoundException(
        `Không tìm thấy khoản học phí với ID ${tuitionId} để cập nhật tài chính.`,
      );
    }

    const currentAmountPaid = Number(tuition.amountPaid);
    const validatedNewTotalAmountDue = Number(newTotalAmountDue);

    const calculated = await this._calculateBalanceAndStatus(
      validatedNewTotalAmountDue,
      currentAmountPaid,
    );

    tuition.totalAmountDue = validatedNewTotalAmountDue;
    tuition.balance = calculated.balance;
    tuition.status = calculated.status;

    return await this.tuitionRepository.save(tuition);
  }
  /**
   * Cập nhật số tiền đã thanh toán cho một khoản học phí và tính toán lại balance, status.
   * Được gọi bởi PaymentTransactionService.
   * @param tuitionId ID của khoản học phí.
   * @param amountChange Số tiền thay đổi (dương cho thanh toán mới/thành công, âm cho hoàn tiền).
   * @returns TuitionEntity đã được cập nhật.
   */
  async updateTuitionAfterPayment(
    tuitionId: number,
    amountChange: number,
  ): Promise<TuitionEntity> {
    const tuition = await this.tuitionRepository.findOne({
      where: { id: tuitionId },
    });
    if (!tuition) {
      throw new NotFoundException(
        `Không tìm thấy khoản học phí với ID ${tuitionId} để cập nhật thanh toán.`,
      );
    }

    let newAmountPaid = Number(tuition.amountPaid) + Number(amountChange);
    if (newAmountPaid < 0) {
      console.warn(
        `Cảnh báo: Số tiền đã thanh toán mới (${newAmountPaid}) bị âm cho học phí ID ${tuitionId} sau khi áp dụng thay đổi ${amountChange}. Đặt lại thành 0.`,
      );
      newAmountPaid = 0;
    }

    const calculated = await this._calculateBalanceAndStatus(
      Number(tuition.totalAmountDue),
      newAmountPaid,
    );

    tuition.amountPaid = newAmountPaid;
    tuition.balance = calculated.balance;
    tuition.status = calculated.status;

    return await this.tuitionRepository.save(tuition);
  }
}
