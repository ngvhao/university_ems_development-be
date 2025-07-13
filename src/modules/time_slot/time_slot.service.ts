import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { TimeSlotEntity } from './entities/time_slot.entity';
import { CreateTimeSlotDto } from './dto/createTimeSlot.dto';
import { UpdateTimeSlotDto } from './dto/updateTimeSlot.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  /**
   * Convert local time to UTC for storage
   */
  private convertLocalTimeToUTC(
    timeString: string,
    timezone: string = 'Asia/Ho_Chi_Minh',
  ): string {
    const [hours, minutes] = timeString.split(':').map(Number);

    // Create a date object in the specified timezone
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Convert to UTC
    const utcDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone }),
    );
    const utcHours = utcDate.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = utcDate.getUTCMinutes().toString().padStart(2, '0');

    return `${utcHours}:${utcMinutes}`;
  }

  /**
   * Convert UTC time back to local timezone
   */
  private convertUTCToLocalTime(
    utcTimeString: string,
    timezone: string = 'Asia/Ho_Chi_Minh',
  ): string {
    const [utcHours, utcMinutes] = utcTimeString.split(':').map(Number);

    // Create UTC date
    const utcDate = new Date();
    utcDate.setUTCHours(utcHours, utcMinutes, 0, 0);

    // Convert to local timezone
    const localDate = new Date(
      utcDate.toLocaleString('en-US', { timeZone: timezone }),
    );
    const localHours = localDate.getHours().toString().padStart(2, '0');
    const localMinutes = localDate.getMinutes().toString().padStart(2, '0');

    return `${localHours}:${localMinutes}`;
  }

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
   * Validate time logic with support for overnight schedules
   * @param startTime - Chuỗi thời gian bắt đầu (HH:MM).
   * @param endTime - Chuỗi thời gian kết thúc (HH:MM).
   * @throws BadRequestException nếu logic không hợp lệ.
   */
  private validateTimeLogic(startTime: string, endTime: string): void {
    // Convert time strings to minutes for comparison
    const endTimeMinutes = this.timeToMinutes(endTime);
    const startTimeMinutes = this.timeToMinutes(startTime);

    // For overnight schedules, endTime can be less than startTime
    // This is valid when the schedule spans across midnight
    if (endTimeMinutes < startTimeMinutes) {
      // This is a valid overnight schedule
      return;
    }

    // For same-day schedules, endTime must be greater than startTime
    if (endTimeMinutes <= startTimeMinutes) {
      throw new BadRequestException(
        `Thời gian kết thúc (${endTime}) phải sau thời gian bắt đầu (${startTime}).`,
      );
    }
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
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
   * Create a new time slot with timezone handling
   */
  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlotEntity> {
    const {
      startTime,
      endTime,
      timezone = 'Asia/Ho_Chi_Minh',
      shift,
    } = createTimeSlotDto;

    // Validate time logic first (before timezone conversion)
    this.validateTimeLogic(startTime, endTime);

    // Convert local times to UTC for storage
    const utcStartTime = this.convertLocalTimeToUTC(startTime, timezone);
    const utcEndTime = this.convertLocalTimeToUTC(endTime, timezone);

    // Check for conflicts
    await this.checkTimeConflict(utcStartTime, utcEndTime);
    await this.checkShiftConflict(shift);

    try {
      const timeSlot = this.timeSlotRepository.create({
        startTime: utcStartTime,
        endTime: utcEndTime,
        shift,
      });

      return await this.timeSlotRepository.save(timeSlot);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Khung giờ với thời gian ${utcStartTime}-${utcEndTime} đã tồn tại.`,
        );
      }
      console.error('Lỗi khi tạo khung giờ:', error);
      throw new BadRequestException(
        'Không thể tạo khung giờ, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Get time slots with timezone conversion
   */
  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<{ data: TimeSlotEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.timeSlotRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { shift: 'ASC' },
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

    // const classWeeklySchedule = await this.classWeeklyScheduleService.getOne({
    //   timeSlotId: id,
    // });
    // if (classWeeklySchedule) {
    //   throw new BadRequestException(
    //     `Không thể xóa Khung giờ ID ${id} vì đang được sử dụng trong lịch học hàng tuần.`,
    //   );
    // }

    // const classAdjustmentSchedule =
    //   await this.classAdjustmentScheduleService.getOne({ timeSlotId: id });
    // if (classAdjustmentSchedule) {
    //   throw new BadRequestException(
    //     `Không thể xóa Khung giờ ID ${id} vì đang được sử dụng trong  lịch học điều chỉnh.`,
    //   );
    // }

    await this.timeSlotRepository.delete(id);
  }
}
