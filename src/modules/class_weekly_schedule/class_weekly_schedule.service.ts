import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Not,
  FindOptionsRelations,
} from 'typeorm';
import { ClassWeeklyScheduleEntity } from './entities/class_weekly_schedule.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateClassWeeklyScheduleDto } from './dtos/createClassWeeklySchedule.dto';
import { UpdateClassWeeklyScheduleDto } from './dtos/updateClassWeeklySchedule.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { EDayOfWeek } from 'src/utils/enums/schedule.enum';

import { ClassGroupService } from 'src/modules/class_group/class_group.service';
import { RoomService } from 'src/modules/room/room.service';
import { StudentService } from '../student/student.service';
import { TimeSlotService } from '../time_slot/time_slot.service';

@Injectable()
export class ClassWeeklyScheduleService {
  constructor(
    @InjectRepository(ClassWeeklyScheduleEntity)
    private classWeeklyScheduleRepository: Repository<ClassWeeklyScheduleEntity>,
    @Inject(forwardRef(() => ClassGroupService))
    private readonly classGroupService: ClassGroupService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => TimeSlotService))
    private readonly timeSlotService: TimeSlotService,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Helper: Kiểm tra sự tồn tại của các khóa ngoại (ClassGroup, Room, TimeSlot).
   * @param dto - Dữ liệu chứa các ID cần kiểm tra.
   * @throws NotFoundException nếu bất kỳ ID nào không hợp lệ.
   */
  private async validateForeignKeys(dto: {
    classGroupId?: number;
    roomId?: number;
    timeSlotId?: number;
  }): Promise<void> {
    const { classGroupId, roomId, timeSlotId } = dto;
    await Promise.all([
      classGroupId !== undefined &&
        this.classGroupService.findOne(classGroupId),
      roomId !== undefined && this.roomService.findOne(roomId),
      timeSlotId !== undefined && this.timeSlotService.findOne(timeSlotId),
    ]);
  }

  /**
   * Helper: Kiểm tra xung đột lịch dựa trên các trường unique.
   * @param scheduleData - Dữ liệu lịch (classGroupId, dayOfWeek, timeSlotId).
   * @param excludeId - (Optional) ID của lịch cần loại trừ khỏi kiểm tra (dùng khi update).
   * @throws ConflictException nếu tìm thấy lịch trùng lặp.
   */
  private async checkConflict(
    scheduleData: {
      classGroupId: number;
      dayOfWeek: EDayOfWeek;
      timeSlotId: number;
      roomId: number;
    },
    excludeId?: number,
  ): Promise<void> {
    const whereCondition: FindOptionsWhere<ClassWeeklyScheduleEntity> = {
      classGroupId: scheduleData.classGroupId,
      dayOfWeek: scheduleData.dayOfWeek,
      timeSlotId: scheduleData.timeSlotId,
    };
    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }
    const conflictingSchedule =
      await this.classWeeklyScheduleRepository.findOne({
        where: whereCondition,
        select: ['id'],
      });

    if (conflictingSchedule) {
      throw new ConflictException(
        `Lịch học cho Nhóm lớp ID ${scheduleData.classGroupId} vào Thứ ${scheduleData.dayOfWeek + 1} - Khung giờ ${scheduleData.timeSlotId} đã tồn tại.`,
      );
    }

    // Kiểm tra phòng có bị trùng lịch vào thời điểm đó không ---
    const conflictingRoomSchedule =
      await this.classWeeklyScheduleRepository.findOne({
        where: {
          roomId: scheduleData.roomId,
          dayOfWeek: scheduleData.dayOfWeek,
          timeSlotId: scheduleData.timeSlotId,
          ...(excludeId && { id: Not(excludeId) }),
        },
        select: ['id', 'classGroupId'],
      });
    if (conflictingRoomSchedule) {
      throw new ConflictException(
        `Phòng học ID ${scheduleData.roomId} đã có lịch vào Thứ ${scheduleData.dayOfWeek + 1} - Khung giờ ${scheduleData.timeSlotId} (Nhóm lớp ID: ${conflictingRoomSchedule.classGroupId}).`,
      );
    }
  }

  /**
   * Helper: Tìm lịch học theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của lịch học.
   * @param relations - Các mối quan hệ cần load.
   * @returns Lịch học tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findScheduleByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<ClassWeeklyScheduleEntity> {
    const schedule = await this.classWeeklyScheduleRepository.findOne({
      where: { id },
      relations,
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy Lịch học với ID ${id}`);
    }
    return schedule;
  }

  /**
   * Tạo một lịch học hàng tuần mới cho nhóm lớp.
   * @param dto - Dữ liệu tạo lịch học.
   * @returns Lịch học vừa được tạo.
   * @throws NotFoundException nếu các ID khóa ngoại không hợp lệ.
   * @throws ConflictException nếu lịch bị trùng (cùng nhóm lớp, cùng ngày, cùng giờ) hoặc phòng bị trùng.
   */
  async create(
    dto: CreateClassWeeklyScheduleDto,
  ): Promise<ClassWeeklyScheduleEntity> {
    await this.validateForeignKeys(dto);

    // 2. Kiểm tra trùng lặp lịch
    await this.checkConflict(dto);

    // 3. Tạo và lưu lịch mới
    try {
      const schedule = this.classWeeklyScheduleRepository.create(dto);
      return await this.classWeeklyScheduleRepository.save(schedule);
    } catch (error) {
      // Xử lý lỗi conflict do race condition nếu checkConflict chưa bắt được
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'Lịch học này có thể đã tồn tại (trùng nhóm lớp, ngày, giờ hoặc phòng).',
        );
      }
      console.error('Lỗi khi tạo lịch học:', error);
      throw new BadRequestException(
        'Không thể tạo lịch học, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Lấy danh sách tất cả lịch học hàng tuần (có phân trang).
   * @param paginationDto - Thông tin phân trang.
   * @returns Danh sách lịch học và metadata phân trang.
   */
  async findAll(paginationDto: PaginationDto): Promise<{
    data: ClassWeeklyScheduleEntity[];
    meta: MetaDataInterface;
  }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.classWeeklyScheduleRepository.findAndCount(
      {
        relations: [
          'classGroup',
          'room',
          'timeSlot',
          'classGroup.courseSemester',
          'classGroup.courseSemester.course',
        ],
        skip: (page - 1) * limit,
        take: limit,
        order: { classGroupId: 'ASC', dayOfWeek: 'ASC', timeSlotId: 'ASC' },
      },
    );

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một lịch học theo ID.
   * @param id - ID của lịch học.
   * @returns Thông tin chi tiết lịch học.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number): Promise<ClassWeeklyScheduleEntity> {
    // Load đủ thông tin cần thiết khi xem chi tiết
    return this.findScheduleByIdOrThrow(id, [
      'classGroup',
      'room',
      'timeSlot',
      'classGroup.courseSemester',
      'classGroup.courseSemester.course',
    ]);
  }

  /**
   * Lấy lịch học hàng tuần của một sinh viên dựa trên các nhóm lớp sinh viên đó đã đăng ký.
   * @param studentId - ID của sinh viên.
   * @returns Danh sách các lịch học của sinh viên.
   * @throws NotFoundException nếu sinh viên không tồn tại.
   */
  async getScheduleByStudentId(
    studentId: number,
  ): Promise<ClassWeeklyScheduleEntity[]> {
    await this.studentService.getOne({ id: studentId });

    const schedules = await this.classWeeklyScheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.classGroup', 'classGroup')
      .innerJoin(
        'classGroup.enrollments',
        'enrollment',
        'enrollment.studentId = :studentId',
        { studentId },
      )
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.timeSlot', 'timeSlot')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('classGroup.semester', 'semester')
      .orderBy('schedule.dayOfWeek', 'ASC')
      .addOrderBy('schedule.timeSlotId', 'ASC')
      .getMany();

    return schedules;
  }

  /**
   * Cập nhật thông tin một lịch học hàng tuần.
   * @param id - ID của lịch học cần cập nhật.
   * @param dto - Dữ liệu cập nhật.
   * @returns Lịch học sau khi cập nhật.
   * @throws NotFoundException nếu lịch học hoặc các FK mới không tồn tại.
   * @throws ConflictException nếu lịch cập nhật bị trùng.
   */
  async update(
    id: number,
    dto: UpdateClassWeeklyScheduleDto,
  ): Promise<ClassWeeklyScheduleEntity> {
    const originalSchedule = await this.findScheduleByIdOrThrow(id);

    await this.validateForeignKeys(dto);

    const finalScheduleData = {
      classGroupId: dto.classGroupId ?? originalSchedule.classGroupId,
      dayOfWeek: dto.dayOfWeek ?? originalSchedule.dayOfWeek,
      timeSlotId: dto.timeSlotId ?? originalSchedule.timeSlotId,
      roomId: dto.roomId ?? originalSchedule.roomId,
    };

    const needsConflictCheck =
      dto.classGroupId ||
      dto.dayOfWeek !== undefined ||
      dto.timeSlotId ||
      dto.roomId;
    if (needsConflictCheck) {
      await this.checkConflict(finalScheduleData, id);
    }

    const scheduleToUpdate = await this.classWeeklyScheduleRepository.preload({
      id: id,
      ...dto,
    });

    try {
      return await this.classWeeklyScheduleRepository.save(scheduleToUpdate!);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Lịch học này có thể đã tồn tại (trùng nhóm lớp, ngày, giờ hoặc phòng).',
        );
      }
      console.error('Lỗi khi cập nhật lịch học:', error);
      throw new BadRequestException(
        'Không thể cập nhật lịch học, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Xóa một lịch học hàng tuần.
   * @param id - ID của lịch học cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy lịch học.
   */
  async remove(id: number): Promise<void> {
    const schedule = await this.findScheduleByIdOrThrow(id);
    await this.classWeeklyScheduleRepository.remove(schedule);
  }

  async getOne(
    condition:
      | FindOptionsWhere<ClassWeeklyScheduleEntity>
      | FindOptionsWhere<ClassWeeklyScheduleEntity>[],
    relations?: FindOptionsRelations<ClassWeeklyScheduleEntity>,
  ): Promise<ClassWeeklyScheduleEntity> {
    const courseMajor = await this.classWeeklyScheduleRepository.findOne({
      where: condition,
      relations,
    });

    return courseMajor;
  }
}
