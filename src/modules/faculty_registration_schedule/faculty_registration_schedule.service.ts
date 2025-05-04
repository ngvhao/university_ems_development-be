import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateFacultyRegistrationScheduleDto } from './dtos/createFacultyRegistrationSchedule.dto';
import { UpdateFacultyRegistrationScheduleDto } from './dtos/updateFacultyRegistrationSchedule.dto';
import { FacultyRegistrationScheduleEntity } from './entities/faculty_registration_schedule.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { FacultyService } from '../faculty/faculty.service';
import { SemesterService } from '../semester/semester.service';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';

@Injectable()
export class FacultyRegistrationScheduleService {
  constructor(
    @InjectRepository(FacultyRegistrationScheduleEntity)
    private readonly scheduleRepository: Repository<FacultyRegistrationScheduleEntity>,
    @Inject(forwardRef(() => FacultyService))
    private readonly facultyService: FacultyService,
    @Inject(forwardRef(() => SemesterService))
    private readonly semesterService: SemesterService,
  ) {}

  /**
   * Helper: Tìm lịch đăng ký theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của lịch đăng ký.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<FacultyRegistrationScheduleEntity> - Lịch đăng ký tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findScheduleByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<FacultyRegistrationScheduleEntity> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations,
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy Lịch đăng ký với ID ${id}`);
    }
    return schedule;
  }

  /**
   * Helper: Kiểm tra sự tồn tại của Khoa và Học kỳ.
   * @param facultyId - ID Khoa.
   * @param semesterId - ID Học kỳ.
   * @throws NotFoundException nếu Khoa hoặc Học kỳ không tồn tại.
   */
  private async validateForeignKeys(
    facultyId: number,
    semesterId: number,
  ): Promise<void> {
    await Promise.all([
      this.facultyService.findOne(facultyId),
      this.semesterService.findOne(semesterId),
    ]);
  }

  /**
   * Helper: Kiểm tra xem đã có lịch đăng ký cho Khoa và Học kỳ này chưa.
   * @param facultyId - ID Khoa.
   * @param semesterId - ID Học kỳ.
   * @param excludeId - (Optional) ID lịch cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu đã tồn tại lịch.
   */
  private async checkConflict(
    facultyId: number,
    semesterId: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<FacultyRegistrationScheduleEntity> = {
      facultyId,
      semesterId,
    };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.scheduleRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Đã tồn tại Lịch đăng ký cho Khoa ID ${facultyId} và Học kỳ ID ${semesterId}.`,
      );
    }
  }

  /**
   * Helper: Chuyển đổi chuỗi ngày giờ sang đối tượng Date.
   * Cần xử lý timezone cẩn thận nếu ứng dụng chạy trên nhiều múi giờ.
   * @param dateString - Chuỗi ngày giờ (YYYY-MM-DD HH:MM:SS hoặc ISO).
   * @returns Đối tượng Date hoặc ném lỗi nếu không hợp lệ.
   */
  private parseDateString(
    dateString: string | Date | undefined | null,
  ): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `Định dạng ngày giờ không hợp lệ: ${dateString}`,
      );
    }
    return date;
  }

  /**
   * Helper: Validate thứ tự và logic ngày tháng trong lịch đăng ký.
   * @param scheduleData - Dữ liệu lịch đăng ký.
   * @throws BadRequestException nếu ngày tháng không hợp lệ.
   */
  private validateDateLogic(scheduleData: {
    preRegistrationStartDate?: Date | null;
    preRegistrationEndDate?: Date | null;
    registrationStartDate?: Date | null;
    registrationEndDate?: Date | null;
  }): void {
    const {
      preRegistrationStartDate,
      preRegistrationEndDate,
      registrationStartDate,
      registrationEndDate,
    } = scheduleData;

    if (
      preRegistrationStartDate &&
      preRegistrationEndDate &&
      preRegistrationEndDate <= preRegistrationStartDate
    ) {
      throw new BadRequestException(
        'Ngày kết thúc ĐK nguyện vọng phải sau ngày bắt đầu ĐK nguyện vọng.',
      );
    }
    if (
      registrationStartDate &&
      preRegistrationStartDate &&
      registrationStartDate < preRegistrationStartDate
    ) {
      throw new BadRequestException(
        'Ngày bắt đầu ĐK chính thức không được trước ngày bắt đầu ĐK nguyện vọng.',
      );
    }
    if (
      registrationStartDate &&
      preRegistrationEndDate &&
      registrationStartDate < preRegistrationEndDate
    ) {
      // Có thể cho phép gối đầu? Tùy nghiệp vụ.
      // throw new BadRequestException("Ngày bắt đầu ĐK chính thức phải sau hoặc bằng ngày kết thúc ĐK nguyện vọng.");
    }
    if (
      registrationStartDate &&
      registrationEndDate &&
      registrationEndDate <= registrationStartDate
    ) {
      throw new BadRequestException(
        'Ngày kết thúc ĐK chính thức phải sau ngày bắt đầu ĐK chính thức.',
      );
    }
  }

  /**
   * Tạo một lịch đăng ký mới cho Khoa trong Học kỳ.
   * @param createDto - Dữ liệu tạo lịch.
   * @returns Promise<FacultyRegistrationScheduleEntity> - Lịch vừa tạo.
   * @throws NotFoundException nếu Khoa hoặc Học kỳ không tồn tại.
   * @throws ConflictException nếu đã có lịch cho Khoa và Học kỳ này.
   * @throws BadRequestException nếu ngày tháng không hợp lệ.
   */
  async create(
    createDto: CreateFacultyRegistrationScheduleDto,
  ): Promise<FacultyRegistrationScheduleEntity> {
    const { facultyId, semesterId } = createDto;

    await this.validateForeignKeys(facultyId, semesterId);

    await this.checkConflict(facultyId, semesterId);

    const parsedDates = {
      preRegistrationStartDate: this.parseDateString(
        createDto.preRegistrationStartDate,
      ),
      preRegistrationEndDate: this.parseDateString(
        createDto.preRegistrationEndDate,
      ),
      registrationStartDate: this.parseDateString(
        createDto.registrationStartDate,
      ),
      registrationEndDate: this.parseDateString(createDto.registrationEndDate),
    };
    this.validateDateLogic(parsedDates);

    try {
      const scheduleData = {
        ...createDto,
        ...parsedDates,
      };
      const newSchedule = this.scheduleRepository.create(scheduleData);
      const saved = await this.scheduleRepository.save(newSchedule);
      return this.findScheduleByIdOrThrow(saved.id, ['faculty', 'semester']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Đã tồn tại Lịch đăng ký cho Khoa ID ${facultyId} và Học kỳ ID ${semesterId}.`,
        );
      }
      console.error('Lỗi khi tạo lịch đăng ký:', error);
      throw new BadRequestException('Không thể tạo lịch đăng ký.');
    }
  }

  /**
   * Lấy danh sách lịch đăng ký (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: FacultyRegistrationScheduleEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    facultyId: number,
  ): Promise<{
    data: FacultyRegistrationScheduleEntity[];
    meta: MetaDataInterface;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const where: FindOptionsWhere<FacultyRegistrationScheduleEntity> = {
      facultyId,
    };

    const [data, total] = await this.scheduleRepository.findAndCount({
      where,
      relations: ['faculty', 'semester'],
      skip: (page - 1) * limit,
      take: limit,
      order: { semesterId: 'DESC', facultyId: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một lịch đăng ký theo ID.
   * @param id - ID của lịch đăng ký.
   * @returns Promise<FacultyRegistrationScheduleEntity> - Thông tin chi tiết.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<FacultyRegistrationScheduleEntity> {
    return this.findScheduleByIdOrThrow(id, ['faculty', 'semester']);
  }

  /**
   * Cập nhật thông tin một lịch đăng ký.
   * @param id - ID lịch cần cập nhật.
   * @param updateDto - Dữ liệu cập nhật.
   * @returns Promise<FacultyRegistrationScheduleEntity> - Lịch sau khi cập nhật.
   * @throws NotFoundException nếu lịch hoặc FK mới không tồn tại.
   * @throws ConflictException nếu thay đổi facultyId/semesterId gây trùng lặp.
   * @throws BadRequestException nếu ngày tháng không hợp lệ.
   */
  async update(
    id: number,
    updateDto: UpdateFacultyRegistrationScheduleDto,
  ): Promise<FacultyRegistrationScheduleEntity> {
    const updatePayload: Partial<FacultyRegistrationScheduleEntity> = {
      facultyId: updateDto.facultyId,
      semesterId: updateDto.semesterId,
      status: updateDto.status,
    };

    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key],
    );

    const scheduleToUpdate = await this.scheduleRepository.preload({
      id: id,
      ...updatePayload,
    });

    if (!scheduleToUpdate) {
      throw new NotFoundException(`Không tìm thấy Lịch đăng ký với ID ${id}`);
    }

    await this.findScheduleByIdOrThrow(id);

    const parsedDates: Partial<FacultyRegistrationScheduleEntity> = {};
    if (updateDto.hasOwnProperty('preRegistrationStartDate'))
      parsedDates.preRegistrationStartDate = this.parseDateString(
        updateDto.preRegistrationStartDate,
      );
    if (updateDto.hasOwnProperty('preRegistrationEndDate'))
      parsedDates.preRegistrationEndDate = this.parseDateString(
        updateDto.preRegistrationEndDate,
      );
    if (updateDto.hasOwnProperty('registrationStartDate'))
      parsedDates.registrationStartDate = this.parseDateString(
        updateDto.registrationStartDate,
      );
    if (updateDto.hasOwnProperty('registrationEndDate'))
      parsedDates.registrationEndDate = this.parseDateString(
        updateDto.registrationEndDate,
      );

    Object.assign(scheduleToUpdate, parsedDates);

    const finalFacultyId = scheduleToUpdate.facultyId;
    const finalSemesterId = scheduleToUpdate.semesterId;
    if (updateDto.facultyId || updateDto.semesterId) {
      await this.validateForeignKeys(finalFacultyId, finalSemesterId);
    }

    this.validateDateLogic(scheduleToUpdate);

    if (updateDto.facultyId || updateDto.semesterId) {
      await this.checkConflict(finalFacultyId, finalSemesterId, id);
    }

    try {
      await this.scheduleRepository.save(scheduleToUpdate);

      return this.findScheduleByIdOrThrow(id, ['faculty', 'semester']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Đã tồn tại Lịch đăng ký cho Khoa ID ${finalFacultyId} và Học kỳ ID ${finalSemesterId}.`,
        );
      }
      console.error('Lỗi khi cập nhật lịch đăng ký:', error);
      throw new BadRequestException('Không thể cập nhật lịch đăng ký.');
    }
  }

  /**
   * Xóa một lịch đăng ký.
   * @param id - ID lịch cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   */
  async remove(id: number): Promise<void> {
    await this.findScheduleByIdOrThrow(id);
    const schedule = await this.findScheduleByIdOrThrow(id);
    if (schedule.status === EFacultyRegistrationScheduleStatus.REGISTRATION) {
      throw new BadRequestException(
        'Không thể xóa lịch đăng ký đang hoạt động.',
      );
    }

    await this.scheduleRepository.delete(id);
  }
}
