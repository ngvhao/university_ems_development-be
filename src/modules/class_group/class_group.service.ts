// src/modules/class-group/class_group.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Not,
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  In,
  FindOptionsSelect,
} from 'typeorm';
import { ClassGroupEntity } from './entities/class_group.entity';
import { CreateClassGroupDto } from './dtos/createClassGroup.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { FilterClassGroupDto } from './dtos/filterClassGroup.dto';
import { UpdateClassGroupDto } from './dtos/updateClassGroup.dto';
import { GenerateScheduleResponseDto } from './dtos/generatecClassGroupSchedule.dto';
import { ClassWeeklyScheduleEntity } from '../class_weekly_schedule/entities/class_weekly_schedule.entity';
import { SemesterEntity } from '../semester/entities/semester.entity';
import { EDayOfWeek } from 'src/utils/enums/schedule.enum';

@Injectable()
export class ClassGroupService {
  constructor(
    @InjectRepository(ClassGroupEntity)
    private readonly classGroupRepository: Repository<ClassGroupEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Helper: Tìm kiếm nhóm lớp theo ID và ném NotFoundException nếu không tồn tại.
   * @param id - ID của nhóm lớp cần tìm.
   * @param relations - Danh sách các mối quan hệ cần load cùng (ví dụ: ['courseSemester']).
   * @returns Promise<ClassGroupEntity> - Entity nhóm lớp tìm được.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp với ID cung cấp.
   */
  private async findGroupByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<ClassGroupEntity> {
    const classGroup = await this.classGroupRepository.findOne({
      where: { id },
      relations,
    });
    if (!classGroup) {
      throw new NotFoundException(`Không tìm thấy Nhóm lớp với ID ${id}`);
    }
    return classGroup;
  }

  /**
   * Tạo một nhóm lớp mới.
   * Kiểm tra sự tồn tại của CourseSemester và kiểm tra trùng lặp groupNumber trong cùng CourseSemester.
   * @param createDto - Dữ liệu để tạo nhóm lớp mới.
   * @returns Promise<ClassGroupEntity> - Nhóm lớp vừa được tạo.
   * @throws NotFoundException nếu semesterId không tồn tại.
   * @throws ConflictException nếu groupNumber đã tồn tại trong semesterId đó.
   */
  async create(createDto: CreateClassGroupDto): Promise<ClassGroupEntity> {
    const { semesterId, groupNumber, courseId } = createDto;

    // Kiểm tra trùng lặp groupNumber trong cùng CourseSemester
    const existingGroup = await this.classGroupRepository.findOne({
      where: { semesterId, groupNumber, courseId },
      select: ['id'],
    });
    if (existingGroup) {
      throw new ConflictException(
        `Nhóm lớp số ${groupNumber} đã tồn tại cho Học phần-Học kỳ ID ${semesterId}.`,
      );
    }

    // Tạo và lưu nhóm mới
    try {
      const newGroup = this.classGroupRepository.create(createDto);
      return await this.classGroupRepository.save(newGroup);
    } catch (error) {
      console.error('Lỗi khi tạo nhóm lớp:', error);
      throw new BadRequestException(
        'Không thể tạo nhóm lớp, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Tạo một nhóm lớp mới.
   * Kiểm tra sự tồn tại của CourseSemester và kiểm tra trùng lặp groupNumber trong cùng CourseSemester.
   * @param createDto - Dữ liệu để tạo nhóm lớp mới.
   * @returns Promise<ClassGroupEntity> - Nhóm lớp vừa được tạo.
   * @throws NotFoundException nếu semesterId không tồn tại.
   * @throws ConflictException nếu groupNumber đã tồn tại trong semesterId đó.
   */
  async createWithWeeklySchedule(
    createDto: GenerateScheduleResponseDto,
    isExtraClassGroup?: boolean,
  ): Promise<ClassGroupEntity[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { scheduledCourses, semesterId } = createDto;

      const semesterExists = await queryRunner.manager.findOne(SemesterEntity, {
        where: { id: semesterId },
      });
      if (!semesterExists) {
        throw new NotFoundException(`Semester ID ${semesterId} không tồn tại.`);
      }

      const createdGroups: ClassGroupEntity[] = [];

      for (const courseSchedule of scheduledCourses) {
        for (const scheduleClassGroup of courseSchedule.scheduledClassGroups) {
          const existingGroup = await queryRunner.manager.findOne(
            ClassGroupEntity,
            {
              where: {
                semesterId,
                courseId: courseSchedule.courseId,
              },
              select: ['id', 'groupNumber'],
              relations: {
                course: true,
              },
              order: { groupNumber: 'DESC' },
            },
          );
          if (existingGroup) {
            console.log('existingGroup:', existingGroup);
            if (isExtraClassGroup) {
              scheduleClassGroup.groupNumber = existingGroup.groupNumber + 1;
            } else {
              console.log(existingGroup);
              throw new ConflictException(
                `Nhóm lớp số ${scheduleClassGroup.groupNumber} đã tồn tại cho Học phần-Học kỳ ID ${semesterId} của môn ${existingGroup.course.name}.`,
              );
            }
          }
          const newClassGroup = queryRunner.manager.create(ClassGroupEntity, {
            groupNumber: scheduleClassGroup.groupNumber,
            courseId: courseSchedule.courseId,
            lecturerId: scheduleClassGroup.lecturerId,
            maxStudents: scheduleClassGroup.maxStudents,
            semesterId: semesterId,
          });
          const savedClassGroup = await queryRunner.manager.save(newClassGroup);
          const schedules = [];
          for (const weeklySchedule of scheduleClassGroup.weeklyScheduleDetails) {
            console.log(
              'weeklySchedule.dayOfWeek@createWithWeeklySchedule: ',
              weeklySchedule,
            );
            const conflictSchedule = await queryRunner.manager.findOne(
              ClassWeeklyScheduleEntity,
              {
                where: {
                  dayOfWeek: EDayOfWeek[weeklySchedule.dayOfWeek],
                  timeSlotId: weeklySchedule.timeSlotId,
                  roomId: weeklySchedule.roomId,
                  startDate: LessThanOrEqual(
                    new Date(scheduleClassGroup.groupEndDate),
                  ),
                  endDate: MoreThanOrEqual(
                    new Date(scheduleClassGroup.groupStartDate),
                  ),
                },
                relations: ['classGroup', 'classGroup.course'],
              },
            );
            if (conflictSchedule) {
              throw new ConflictException(
                `Nhóm lớp số ${scheduleClassGroup.groupNumber} bị trùng lịch với nhóm lớp ${conflictSchedule.classGroupId} của môn ${conflictSchedule.classGroup.course.name}.`,
              );
            }

            const newWeeklySchedule = queryRunner.manager.create(
              ClassWeeklyScheduleEntity,
              {
                classGroupId: savedClassGroup.id,
                dayOfWeek: EDayOfWeek[weeklySchedule.dayOfWeek],
                timeSlotId: weeklySchedule.timeSlotId,
                roomId: weeklySchedule.roomId,
                lecturerId: scheduleClassGroup.lecturerId,
                startDate: scheduleClassGroup.groupStartDate,
                endDate: scheduleClassGroup.groupEndDate,
                scheduledDates: weeklySchedule.scheduledDates,
              },
            );
            const savedWeeklySchedule =
              await queryRunner.manager.save(newWeeklySchedule);
            schedules.push(savedWeeklySchedule);
          }
          savedClassGroup.schedules = schedules;
          createdGroups.push(savedClassGroup);
        }
      }

      await queryRunner.commitTransaction();

      return createdGroups;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new ConflictException(
          'Dữ liệu bị trùng lặp trong database: ',
          error,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách các nhóm lớp có phân trang và lọc.
   * @param paginationDto - Thông tin phân trang (page, limit).
   * @param filterDto - Thông tin lọc (semesterId, status, groupNumber).
   * @returns Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> - Danh sách nhóm lớp và metadata phân trang.
   */
  async getClassGroupsForRegistration({
    filterDto,
    paginationDto,
  }: {
    filterDto: FilterClassGroupDto;
    paginationDto: PaginationDto;
  }): Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { semesterId, statuses, majorId, yearAdmission } = filterDto;

    const queryBuilder =
      this.classGroupRepository.createQueryBuilder('classGroup');

    queryBuilder
      .select([
        'classGroup.id',
        'classGroup.groupNumber',
        'classGroup.semesterId',
        'classGroup.status',
        'classGroup.registeredStudents',
        'classGroup.maxStudents',
      ])
      .leftJoin('classGroup.course', 'course')
      .addSelect([
        'course.id',
        'course.courseCode',
        'course.name',
        'course.credit',
        'course.description',
      ])

      .leftJoin('classGroup.semester', 'semester')

      .leftJoin('classGroup.schedules', 'schedules')
      .addSelect([
        'schedules.startDate',
        'schedules.endDate',
        'schedules.dayOfWeek',
        'schedules.scheduledDates',
      ])

      .leftJoin('schedules.room', 'room')
      .addSelect('room.roomNumber')

      .leftJoin('schedules.timeSlot', 'timeSlot')
      .addSelect(['timeSlot.shift', 'timeSlot.startTime', 'timeSlot.endTime'])

      .leftJoin('course.curriculumCourses', 'curriculumCourse')
      .leftJoin('curriculumCourse.prerequisiteCourse', 'prerequisiteCourse')
      .addSelect([
        'prerequisiteCourse.id',
        'prerequisiteCourse.courseCode',
        'prerequisiteCourse.name',
      ]);

    if (semesterId !== undefined) {
      queryBuilder.andWhere('classGroup.semesterId = :semesterId', {
        semesterId,
      });
    }

    if (statuses !== undefined && statuses.length > 0) {
      queryBuilder.andWhere('classGroup.status IN (:...statuses)', {
        statuses,
      });
    }

    if (majorId !== undefined && yearAdmission !== undefined) {
      queryBuilder
        .innerJoin('course.curriculumCourses', 'filterCurriculumCourse')
        .innerJoin('filterCurriculumCourse.curriculum', 'filterCurriculum')
        .andWhere('filterCurriculum.majorId = :majorId', { majorId })
        .andWhere('filterCurriculum.startAcademicYear = :yearAdmission', {
          yearAdmission,
        });

      queryBuilder
        .addSelect(['filterCurriculumCourse.id'])
        .leftJoin('filterCurriculumCourse.prerequisiteCourse', 'prerequisite')
        .addSelect([
          'prerequisite.id',
          'prerequisite.courseCode',
          'prerequisite.name',
        ]);
    }

    queryBuilder
      .orderBy('course.courseCode', 'ASC')
      .addOrderBy('classGroup.groupNumber');

    const [data, total] = await queryBuilder.cache(true).getManyAndCount();

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy danh sách các nhóm lớp có phân trang và lọc.
   * @param paginationDto - Thông tin phân trang (page, limit).
   * @param filterDto - Thông tin lọc (semesterId, status, groupNumber).
   * @returns Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> - Danh sách nhóm lớp và metadata phân trang.
   */
  async findAll({
    filterDto,
    paginationDto,
    // relations,
    // select,
  }: {
    filterDto: FilterClassGroupDto;
    paginationDto: PaginationDto;
    // relations?: FindOptionsRelations<ClassGroupEntity>;
    select?: FindOptionsSelect<ClassGroupEntity>;
  }): Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { semesterId, statuses, majorId, yearAdmission } = filterDto;

    const where: FindOptionsWhere<ClassGroupEntity> = {};
    if (semesterId !== undefined) {
      where.semesterId = semesterId;
    }
    if (statuses !== undefined) {
      where.status = In(statuses);
    }

    if (majorId !== undefined && yearAdmission !== undefined) {
      where.course = {
        curriculumCourses: {
          curriculum: {
            majorId: majorId,
            startAcademicYear: yearAdmission,
          },
        },
      };
    }

    const [data, total] = await this.classGroupRepository.findAndCount({
      where,
      relations: {
        course: true,
        semester: true,
        schedules: {
          timeSlot: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { semesterId: 'ASC', groupNumber: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async getOne(
    condition: FindOptionsWhere<ClassGroupEntity>,
  ): Promise<ClassGroupEntity> {
    const classGroup = await this.classGroupRepository.findOne({
      where: condition,
      relations: {
        course: true,
      },
    });

    return classGroup;
  }

  /**
   * Lấy thông tin chi tiết của một nhóm lớp theo ID.
   * @param id - ID của nhóm lớp cần lấy thông tin.
   * @returns Promise<ClassGroupEntity> - Thông tin chi tiết của nhóm lớp.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   */
  async findOne(id: number): Promise<ClassGroupEntity> {
    return this.findGroupByIdOrThrow(id, [
      'courseSemester',
      'courseSemester.course',
      'courseSemester.semester',
      // 'enrollments',
    ]);
  }

  /**
   * Cập nhật thông tin của một nhóm lớp.
   * Không cho phép thay đổi semesterId.
   * Kiểm tra trùng lặp nếu groupNumber thay đổi.
   * Kiểm tra logic về maxStudents và registeredStudents.
   * @param id - ID của nhóm lớp cần cập nhật.
   * @param updateDto - Dữ liệu cập nhật.
   * @returns Promise<ClassGroupEntity> - Nhóm lớp sau khi đã cập nhật.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   * @throws BadRequestException nếu cố gắng thay đổi semesterId hoặc nếu maxStudents/registeredStudents không hợp lệ.
   * @throws ConflictException nếu groupNumber mới bị trùng.
   */
  async update(
    id: number,
    updateDto: UpdateClassGroupDto,
  ): Promise<ClassGroupEntity> {
    const existingGroup = await this.classGroupRepository.preload({
      id: id,
      ...updateDto,
    });

    if (!existingGroup) {
      throw new NotFoundException(`Không tìm thấy Nhóm lớp với ID ${id}`);
    }

    const originalGroup = await this.findGroupByIdOrThrow(id);

    if (
      updateDto.semesterId &&
      updateDto.semesterId !== originalGroup.semesterId
    ) {
      throw new BadRequestException(
        'Không thể thay đổi Học phần-Học kỳ của một Nhóm lớp đã tồn tại.',
      );
    }

    if (
      updateDto.groupNumber &&
      updateDto.groupNumber !== originalGroup.groupNumber
    ) {
      const conflict = await this.classGroupRepository.findOne({
        where: {
          semesterId: originalGroup.semesterId,
          groupNumber: updateDto.groupNumber,
          id: Not(id),
        },
        select: ['id'],
      });
      if (conflict) {
        throw new ConflictException(
          `Nhóm lớp số ${updateDto.groupNumber} đã tồn tại cho Học phần-Học kỳ ID ${originalGroup.semesterId}.`,
        );
      }
    }

    // Kiểm tra logic maxStudents và registeredStudents
    const finalMaxStudents = existingGroup.maxStudents;
    const finalRegisteredStudents = existingGroup.registeredStudents;
    const originalRegisteredStudents = originalGroup.registeredStudents;

    if (
      updateDto.maxStudents !== undefined &&
      updateDto.maxStudents < originalRegisteredStudents
    ) {
      throw new BadRequestException(
        `Không thể đặt Số lượng tối đa (${updateDto.maxStudents}) nhỏ hơn số sinh viên đã đăng ký hiện tại (${originalRegisteredStudents}).`,
      );
    }
    if (
      updateDto.registeredStudents !== undefined &&
      finalRegisteredStudents > finalMaxStudents
    ) {
      throw new BadRequestException(
        `Không thể đặt Số sinh viên đăng ký (${finalRegisteredStudents}) lớn hơn Số lượng tối đa (${finalMaxStudents}).`,
      );
    }

    try {
      return await this.classGroupRepository.save(existingGroup);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Nhóm lớp số ${existingGroup.groupNumber} có thể đã tồn tại cho Học phần-Học kỳ ID ${existingGroup.semesterId}.`,
        );
      }
      console.error('Lỗi khi cập nhật nhóm lớp:', error);
      throw new BadRequestException(
        'Không thể cập nhật nhóm lớp, vui lòng kiểm tra lại dữ liệu.',
      );
    }
  }

  /**
   * Xóa một nhóm lớp.
   * Chỉ cho phép xóa nếu chưa có sinh viên nào đăng ký.
   * @param id - ID của nhóm lớp cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   * @throws BadRequestException nếu nhóm lớp đã có sinh viên đăng ký.
   */
  async remove(id: number): Promise<void> {
    const group = await this.findGroupByIdOrThrow(id);

    // Kiểm tra ràng buộc trước khi xóa
    if (group.registeredStudents > 0) {
      throw new BadRequestException(
        `Không thể xóa Nhóm lớp ID ${id} vì đã có ${group.registeredStudents} sinh viên đăng ký. Cân nhắc chuyển trạng thái thành 'Đã hủy'.`,
      );
    }

    const result = await this.classGroupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy Nhóm lớp với ID ${id} để xóa.`,
      );
    }
  }

  /**
   * Tăng số lượng sinh viên đã đăng ký cho một nhóm lớp.
   * Chỉ thực hiện nếu nhóm lớp đang mở và chưa đầy.
   * Thường được gọi từ logic đăng ký môn học của sinh viên.
   * @param id - ID của nhóm lớp.
   * @param count - Số lượng sinh viên cần tăng (mặc định là 1).
   * @returns Promise<ClassGroupEntity> - Nhóm lớp sau khi cập nhật số lượng.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   * @throws BadRequestException nếu nhóm lớp không mở hoặc đã đầy.
   */
  async incrementRegistered(id: number, count = 1): Promise<ClassGroupEntity> {
    const group = await this.findGroupByIdOrThrow(id);

    if (group.status !== EClassGroupStatus.OPEN_FOR_REGISTER) {
      throw new BadRequestException(
        `Nhóm lớp ID ${id} không mở để đăng ký (trạng thái: ${group.status}).`,
      );
    }
    if (group.registeredStudents + count > group.maxStudents) {
      throw new BadRequestException(
        `Không thể đăng ký. Nhóm lớp ID ${id} đã đầy (${group.registeredStudents}/${group.maxStudents}).`,
      );
    }

    group.registeredStudents += count;
    if (group.registeredStudents === group.maxStudents) {
      group.status = EClassGroupStatus.CLOSED_FOR_REGISTER;
    }
    return this.classGroupRepository.save(group);
  }

  /**
   * Giảm số lượng sinh viên đã đăng ký cho một nhóm lớp.
   * Chỉ thực hiện nếu số lượng không bị âm.
   * Thường được gọi từ logic hủy đăng ký môn học của sinh viên.
   * @param id - ID của nhóm lớp.
   * @param count - Số lượng sinh viên cần giảm (mặc định là 1).
   * @returns Promise<ClassGroupEntity> - Nhóm lớp sau khi cập nhật số lượng.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   * @throws BadRequestException nếu số lượng đăng ký sau khi giảm bị âm.
   */
  async decrementRegistered(id: number, count = 1): Promise<ClassGroupEntity> {
    const group = await this.findGroupByIdOrThrow(id);

    if (group.registeredStudents - count < 0) {
      throw new BadRequestException(
        `Không thể hủy đăng ký. Số lượng đăng ký không thể âm cho Nhóm lớp ID ${id}.`,
      );
    }

    const wasFull = group.registeredStudents === group.maxStudents;
    group.registeredStudents -= count;

    if (
      group.status === EClassGroupStatus.CLOSED_FOR_REGISTER &&
      wasFull &&
      group.registeredStudents < group.maxStudents
    ) {
      group.status = EClassGroupStatus.OPEN_FOR_REGISTER;
    }
    return this.classGroupRepository.save(group);
  }

  /**
   * Cập nhật trạng thái của một nhóm lớp.
   * @param id - ID của nhóm lớp cần cập nhật trạng thái.
   * @param status - Trạng thái mới (OPEN, CLOSED, CANCELLED).
   * @returns Promise<ClassGroupEntity> - Nhóm lớp sau khi cập nhật trạng thái.
   * @throws NotFoundException nếu không tìm thấy nhóm lớp.
   */
  async updateStatus(
    id: number,
    status: EClassGroupStatus,
  ): Promise<ClassGroupEntity> {
    const group = await this.findGroupByIdOrThrow(id);
    if (
      group.status === EClassGroupStatus.CANCELLED &&
      status === EClassGroupStatus.OPEN_FOR_REGISTER
    ) {
      throw new BadRequestException('Không thể mở lại một nhóm lớp đã bị hủy.');
    }

    group.status = status;
    return this.classGroupRepository.save(group);
  }
}
