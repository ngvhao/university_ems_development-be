import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { CreateAdjustmentScheduleDto } from './dto/createClassAdjustmentSchedule.dto';
import { UpdateAdjustmentScheduleDto } from './dto/updateClassAdjustmentSchedule.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { RoomService } from 'src/modules/room/room.service';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { ClassGroupService } from '../class_group/class_group.service';
import { ClassGroupEntity } from '../class_group/entities/class_group.entity';
import { ClassAdjustmentScheduleEntity } from './entities/class_adjustment_schedule.entity';
import { TimeSlotService } from '../time_slot/time_slot.service';
import { TimeSlotEntity } from '../time_slot/entities/time_slot.entity';
import { StudentService } from '../student/student.service';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

@Injectable()
export class ClassAdjustmentScheduleService {
  constructor(
    @InjectRepository(ClassAdjustmentScheduleEntity)
    private readonly adjustmentRepo: Repository<ClassAdjustmentScheduleEntity>,
    @Inject(forwardRef(() => ClassGroupService))
    private readonly classGroupService: ClassGroupService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => TimeSlotService))
    private readonly timeSlotService: TimeSlotService,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Helper: Kiểm tra sự tồn tại của các khóa ngoại.
   */
  private async validateForeignKeys(dto: {
    classGroupId?: number;
    roomId?: number;
    timeSlotId?: number;
  }): Promise<{
    classGroup?: ClassGroupEntity;
    room?: RoomEntity;
    timeSlot?: TimeSlotEntity;
  }> {
    const { classGroupId, roomId, timeSlotId } = dto;
    const result: {
      classGroup?: ClassGroupEntity;
      room?: RoomEntity;
      timeSlot?: TimeSlotEntity;
    } = {};
    await Promise.all([
      (async () => {
        if (classGroupId !== undefined) {
          result.classGroup =
            await this.classGroupService.findOne(classGroupId);
        }
      })(),
      (async () => {
        if (roomId !== undefined) {
          result.room = await this.roomService.findOne(roomId);
        }
      })(),
      (async () => {
        if (timeSlotId !== undefined) {
          result.timeSlot = await this.timeSlotService.findOne(timeSlotId);
        }
      })(),
    ]);

    return result;
  }

  /**
   * Helper: Tìm kiếm lịch điều chỉnh bằng ID, ném lỗi nếu không tìm thấy.
   */
  private async findAdjustmentById(
    id: number,
    relations?: string[],
  ): Promise<ClassAdjustmentScheduleEntity> {
    const adjustment = await this.adjustmentRepo.findOne({
      where: { id },
      relations: relations ?? ['classGroup', 'room', 'timeSlot'],
    });
    if (!adjustment) {
      throw new NotFoundException(
        `Không tìm thấy lịch điều chỉnh với ID ${id}`,
      );
    }
    return adjustment;
  }

  async create(
    dto: CreateAdjustmentScheduleDto,
  ): Promise<ClassAdjustmentScheduleEntity> {
    await this.validateForeignKeys(dto);

    const existing = await this.adjustmentRepo.findOne({
      where: {
        adjustmentDate: dto.adjustmentDate,
        roomId: dto.roomId,
        timeSlotId: dto.timeSlotId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Đã có lịch điều chỉnh khác cho phòng và khung giờ này vào ngày này.',
      );
    }

    try {
      const newAdjustment = this.adjustmentRepo.create(dto);
      return await this.adjustmentRepo.save(newAdjustment);
    } catch (error) {
      console.error('Lỗi khi tạo lịch điều chỉnh:', error);
      throw new BadRequestException(
        'Không thể tạo lịch điều chỉnh. Vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: ClassAdjustmentScheduleEntity[];
    meta: MetaDataInterface;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.adjustmentRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        adjustmentDate: 'DESC',
      },
      relations: {
        classGroup: {
          course: true,
          semester: true,
          lecturer: {
            user: true,
          },
        },
        room: true,
        timeSlot: true,
      },
      select: {
        classGroup: {
          id: true,
          groupNumber: true,
          course: {
            id: true,
            name: true,
          },
          semester: {
            id: true,
            semesterCode: true,
          },
          lecturer: {
            id: true,
            user: {
              id: true,
              firstName: true,
              lastName: true,
              personalEmail: true,
              universityEmail: true,
            },
          },
        },
        room: true,
        timeSlot: true,
      },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(id: number): Promise<ClassAdjustmentScheduleEntity> {
    return this.findAdjustmentById(id);
  }

  async update(
    id: number,
    dto: UpdateAdjustmentScheduleDto,
  ): Promise<ClassAdjustmentScheduleEntity> {
    await this.findAdjustmentById(id, []);
    await this.validateForeignKeys(dto);

    const adjustmentToUpdate = await this.adjustmentRepo.preload({
      id: id,
      ...dto,
    });

    if (!adjustmentToUpdate) {
      throw new NotFoundException(
        `Không tìm thấy lịch điều chỉnh với ID ${id} để cập nhật.`,
      );
    }

    try {
      return await this.adjustmentRepo.save(adjustmentToUpdate);
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch điều chỉnh:', error);
      throw new BadRequestException(
        'Không thể cập nhật lịch điều chỉnh. Vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  async remove(id: number): Promise<void> {
    const adjustmentToRemove = await this.findAdjustmentById(id, []);

    await this.adjustmentRepo.remove(adjustmentToRemove);
  }

  async getOne(
    condition:
      | FindOptionsWhere<ClassAdjustmentScheduleEntity>
      | FindOptionsWhere<ClassAdjustmentScheduleEntity>[],
    relations?: FindOptionsRelations<ClassAdjustmentScheduleEntity>,
  ): Promise<ClassAdjustmentScheduleEntity> {
    const adjustments = await this.adjustmentRepo.findOne({
      where: condition,
      relations,
    });

    return adjustments;
  }

  async find(
    condition:
      | FindOptionsWhere<ClassAdjustmentScheduleEntity>
      | FindOptionsWhere<ClassAdjustmentScheduleEntity>[],
    relations?: FindOptionsRelations<ClassAdjustmentScheduleEntity>,
  ): Promise<ClassAdjustmentScheduleEntity[]> {
    const adjustments = await this.adjustmentRepo.find({
      where: condition,
      relations,
    });

    return adjustments;
  }

  /**
   * Lấy tất cả các lịch học đã được điều chỉnh của một sinh viên dựa trên các nhóm lớp sinh viên đó đã đăng ký.
   * @param studentId - ID của sinh viên.
   * @returns Danh sách các lịch học đã được điều chỉnh của sinh viên.
   * @throws NotFoundException nếu sinh viên không tồn tại.
   */
  async getAdjustedSchedulesByStudentId(
    studentId: number,
    semesterCode?: string,
  ): Promise<ClassAdjustmentScheduleEntity[]> {
    const where: FindOptionsWhere<ClassAdjustmentScheduleEntity> = {};
    where.classGroup = {
      enrollments: {
        studentId: studentId,
        status: In([
          EEnrollmentStatus.ENROLLED,
          EEnrollmentStatus.WITHDRAWN,
          EEnrollmentStatus.PASSED,
        ]),
      },
    };
    if (semesterCode) {
      where.classGroup = {
        semester: {
          semesterCode: semesterCode,
        },
      };
    }

    const schedules = await this.adjustmentRepo.find({
      where,
      relations: {
        room: true,
        timeSlot: true,
        classGroup: {
          course: true,
          semester: true,
        },
      },
      order: {
        adjustmentDate: 'ASC',
        timeSlotId: 'ASC',
      },
    });

    return schedules;
  }

  /**
   * Lấy tất cả các lịch học đã được điều chỉnh của một sinh viên dựa trên các nhóm lớp sinh viên đó đã đăng ký.
   * @param studentId - ID của sinh viên.
   * @returns Danh sách các lịch học đã được điều chỉnh của sinh viên.
   * @throws NotFoundException nếu sinh viên không tồn tại.
   */
  async getAdjustedSchedulesByLecturerId(
    lecturerId: number,
    semesterCode?: string,
    classGroupIds?: number[],
  ): Promise<ClassAdjustmentScheduleEntity[]> {
    const where: FindOptionsWhere<ClassAdjustmentScheduleEntity> = {};
    if (classGroupIds) {
      where.classGroup = {
        id: In(classGroupIds),
      };
    }
    if (semesterCode) {
      where.classGroup = {
        semester: {
          semesterCode: semesterCode,
        },
      };
    }
    where.classGroup = {
      lecturerId: lecturerId,
    };
    const schedules = await this.adjustmentRepo.find({
      where,
      relations: {
        room: true,
        timeSlot: true,
        classGroup: {
          course: true,
          semester: true,
        },
      },
      order: {
        adjustmentDate: 'ASC',
        timeSlotId: 'ASC',
      },
    });
    return schedules;
  }
}
