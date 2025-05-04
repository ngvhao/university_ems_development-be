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
import { CreateTimeSlotDto } from './dto/createTimeSlot.dto';
import { UpdateTimeSlotDto } from './dto/updateTimeSlot.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { TimeSlotEntity } from './entities/time_slot.entity';
import { ClassWeeklyScheduleService } from '../class_weekly_schedule/class_weekly_schedule.service';
import { ClassAdjustmentScheduleService } from '../class_adjustment_schedule/class_adjustment_schedule.service';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
    @Inject(forwardRef(() => ClassWeeklyScheduleService))
    private readonly classWeeklyScheduleService: ClassWeeklyScheduleService,
    @Inject(forwardRef(() => ClassAdjustmentScheduleService))
    private readonly classAdjustmentScheduleService: ClassAdjustmentScheduleService,
  ) {}

  /**
   * Helper: Tìm Khung giờ theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của Khung giờ.
   * @returns Promise<TimeSlotEntity> - Khung giờ tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<TimeSlotEntity> {
    const timeSlot = await this.timeSlotRepository.findOne({ where: { id } });
    if (!timeSlot) {
      throw new NotFoundException(`Không tìm thấy Khung giờ với ID ${id}`);
    }
    return timeSlot;
  }

  /**
   * Helper: Validate logic thời gian (endTime > startTime).
   * @param startTime - Chuỗi thời gian bắt đầu (HH:MM).
   * @param endTime - Chuỗi thời gian kết thúc (HH:MM).
   * @throws BadRequestException nếu logic không hợp lệ.
   */
  private validateTimeLogic(startTime: string, endTime: string): void {
    if (endTime <= startTime) {
      throw new BadRequestException(
        `Thời gian kết thúc (${endTime}) phải sau thời gian bắt đầu (${startTime}).`,
      );
    }
  }

  /**
   * Helper: Kiểm tra trùng lặp Khung giờ dựa trên thời gian bắt đầu và kết thúc.
   * @param startTime - Thời gian bắt đầu.
   * @param endTime - Thời gian kết thúc.
   * @param excludeId - (Optional) ID cần loại trừ khi kiểm tra (dùng khi update).
   * @throws ConflictException nếu đã tồn tại khung giờ trùng thời gian.
   */
  private async checkTimeConflict(
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<TimeSlotEntity> = { startTime, endTime };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.timeSlotRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Khung giờ từ ${startTime} đến ${endTime} đã tồn tại.`,
      );
    }
  }
  /**
   * Helper: Kiểm tra trùng lặp ca/tiết học.
   * @param shift - Ca/tiết học cần kiểm tra.
   * @param excludeId - (Optional) ID cần loại trừ khi kiểm tra.
   * @throws ConflictException nếu ca/tiết học đã tồn tại.
   */
  private async checkShiftConflict(
    shift: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<TimeSlotEntity> = { shift };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.timeSlotRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(`Ca/tiết học số ${shift} đã tồn tại.`);
    }
  }

  /**
   * Tạo một Khung giờ mới.
   * @param createTimeSlotDto - Dữ liệu tạo Khung giờ.
   * @returns Promise<TimeSlotEntity> - Khung giờ vừa tạo.
   * @throws BadRequestException nếu thời gian không hợp lệ.
   * @throws ConflictException nếu khung giờ bị trùng (thời gian hoặc ca).
   */
  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlotEntity> {
    const { startTime, endTime, shift } = createTimeSlotDto;

    // Check conflict thời gian và ca/tiết
    await this.checkTimeConflict(startTime, endTime);
    await this.checkShiftConflict(shift);

    // Tạo và lưu
    try {
      const timeSlot = this.timeSlotRepository.create(createTimeSlotDto);
      return await this.timeSlotRepository.save(timeSlot);
    } catch (error) {
      if (error.code === '23505') {
        if (error.detail?.includes('(start_time, end_time)')) {
          throw new ConflictException(
            `Khung giờ từ ${startTime} đến ${endTime} có thể đã tồn tại.`,
          );
        }
        if (error.detail?.includes('(shift)')) {
          throw new ConflictException(
            `Ca/tiết học số ${shift} có thể đã tồn tại.`,
          );
        }
      }
      console.error('Lỗi khi tạo Khung giờ:', error);
      throw new BadRequestException('Không thể tạo Khung giờ.');
    }
  }

  /**
   * Lấy danh sách Khung giờ (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Promise<{ data: TimeSlotEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: TimeSlotEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    // Thêm bộ lọc nếu cần (theo shift?)
    // const where: FindOptionsWhere<TimeSlotEntity> = {};

    const [data, total] = await this.timeSlotRepository.findAndCount({
      // where,
      skip: (page - 1) * limit,
      take: limit,
      order: { shift: 'ASC', startTime: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Cập nhật thông tin một Khung giờ.
   * @param id - ID Khung giờ cần cập nhật.
   * @param updateTimeSlotDto - Dữ liệu cập nhật.
   * @returns Promise<TimeSlotEntity> - Khung giờ sau khi cập nhật.
   * @throws NotFoundException nếu Khung giờ không tồn tại.
   * @throws BadRequestException nếu thời gian không hợp lệ.
   * @throws ConflictException nếu khung giờ cập nhật bị trùng.
   */
  async update(
    id: number,
    updateTimeSlotDto: UpdateTimeSlotDto,
  ): Promise<TimeSlotEntity> {
    const timeSlotToUpdate = await this.timeSlotRepository.preload({
      id: id,
      ...updateTimeSlotDto,
    });

    if (!timeSlotToUpdate) {
      throw new NotFoundException(`Không tìm thấy Khung giờ với ID ${id}`);
    }

    const originalTimeSlot = await this.findOne(id);

    const finalStartTime = timeSlotToUpdate.startTime;
    const finalEndTime = timeSlotToUpdate.endTime;
    const finalShift = timeSlotToUpdate.shift;

    this.validateTimeLogic(finalStartTime, finalEndTime);

    const timeChanged =
      finalStartTime !== originalTimeSlot.startTime ||
      finalEndTime !== originalTimeSlot.endTime;
    const shiftChanged = finalShift !== originalTimeSlot.shift;

    if (timeChanged) {
      await this.checkTimeConflict(finalStartTime, finalEndTime, id);
    }
    if (shiftChanged) {
      await this.checkShiftConflict(finalShift, id);
    }

    try {
      return await this.timeSlotRepository.save(timeSlotToUpdate);
    } catch (error) {
      if (error.code === '23505') {
        if (error.detail?.includes('(start_time, end_time)')) {
          throw new ConflictException(
            `Khung giờ từ ${finalStartTime} đến ${finalEndTime} có thể đã tồn tại.`,
          );
        }
        if (error.detail?.includes('(shift)')) {
          throw new ConflictException(
            `Ca/tiết học số ${finalShift} có thể đã tồn tại.`,
          );
        }
      }
      console.error('Lỗi khi cập nhật Khung giờ:', error);
      throw new BadRequestException('Không thể cập nhật Khung giờ.');
    }
  }

  /**
   * Xóa một Khung giờ.
   * @param id - ID Khung giờ cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   * @throws BadRequestException nếu Khung giờ đang được sử dụng.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const classWeeklySchedule = await this.classWeeklyScheduleService.getOne({
      timeSlotId: id,
    });
    if (classWeeklySchedule) {
      throw new BadRequestException(
        `Không thể xóa Khung giờ ID ${id} vì đang được sử dụng trong lịch học hàng tuần.`,
      );
    }

    const classAdjustmentSchedule =
      await this.classAdjustmentScheduleService.getOne({ timeSlotId: id });
    if (classAdjustmentSchedule) {
      throw new BadRequestException(
        `Không thể xóa Khung giờ ID ${id} vì đang được sử dụng trong  lịch học điều chỉnh.`,
      );
    }

    await this.timeSlotRepository.delete(id);
  }
}
