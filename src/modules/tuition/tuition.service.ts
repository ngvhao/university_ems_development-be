import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { TuitionEntity } from './entities/tuition.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ETuitionStatus } from 'src/utils/enums/tuition.enum';
import { StudentService } from '../student/student.service';
import { SemesterService } from '../semester/semester.service';
import { CreateTuitionDto } from './dto/createTuition.dto';
import { UpdateTuitionDto } from './dto/updateTuition.dto';

@Injectable()
export class TuitionService {
  constructor(
    @InjectRepository(TuitionEntity)
    private readonly tuitionRepository: Repository<TuitionEntity>,
    private readonly studentService: StudentService,
    private readonly semesterService: SemesterService,
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
      status: DtoStatus !== undefined ? DtoStatus : calculated.status, // Ưu tiên status từ DTO nếu có
    });

    return await this.tuitionRepository.save(newTuition);
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
