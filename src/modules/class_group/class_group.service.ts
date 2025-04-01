import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Not } from 'typeorm';
import { ClassGroupEntity } from './entities/class_group.entity';
import { CourseSemesterService } from 'src/modules/course_semester/course_semester.service';
import { CreateClassGroupDto } from './dtos/createClassGroup.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { FilterClassGroupDto } from './dtos/filterClassGroup.dto';
import { UpdateClassGroupDto } from './dtos/updateClassGroup.dto';

@Injectable()
export class ClassGroupService {
  constructor(
    @InjectRepository(ClassGroupEntity)
    private readonly classGroupRepository: Repository<ClassGroupEntity>,
    @Inject(forwardRef(() => CourseSemesterService))
    private readonly courseSemesterService: CourseSemesterService,
  ) {}

  async create(createDto: CreateClassGroupDto): Promise<ClassGroupEntity> {
    const { courseSemesterId, groupNumber } = createDto;

    await this.courseSemesterService.getOne({ id: courseSemesterId });

    const existingGroup = await this.classGroupRepository.findOne({
      where: { courseSemesterId, groupNumber },
    });
    if (existingGroup) {
      throw new ConflictException(
        `Group number ${groupNumber} already exists for CourseSemester ID ${courseSemesterId}.`,
      );
    }

    const newGroup = this.classGroupRepository.create(createDto);
    return await this.classGroupRepository.save(newGroup);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterClassGroupDto,
  ): Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { courseSemesterId, status, groupNumber } = filterDto;

    const where: FindManyOptions<ClassGroupEntity>['where'] = {};
    if (courseSemesterId) {
      where.courseSemesterId = courseSemesterId;
    }
    if (status) {
      where.status = status;
    }
    if (groupNumber) {
      where.groupNumber = groupNumber;
    }

    const [data, total] = await this.classGroupRepository.findAndCount({
      where,
      relations: [
        'courseSemester',
        'courseSemester.course',
        'courseSemester.semester',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { courseSemesterId: 'ASC', groupNumber: 'ASC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(id: number): Promise<ClassGroupEntity> {
    const classGroup = await this.classGroupRepository.findOne({
      where: { id },
      relations: [
        'courseSemester',
        'courseSemester.course',
        'courseSemester.semester',
      ],
    });
    if (!classGroup) {
      throw new NotFoundException(`ClassGroup with ID ${id} not found`);
    }
    return classGroup;
  }

  async update(
    id: number,
    updateDto: UpdateClassGroupDto,
  ): Promise<ClassGroupEntity> {
    const existingGroup = await this.findOne(id);

    const {
      groupNumber,
      courseSemesterId,
      maxStudents,
      registeredStudents,
      ...restUpdateData
    } = updateDto;

    if (
      courseSemesterId &&
      courseSemesterId !== existingGroup.courseSemesterId
    ) {
      throw new BadRequestException(
        'Cannot change the CourseSemester of a ClassGroup.',
      );
    }

    if (groupNumber && groupNumber !== existingGroup.groupNumber) {
      const conflict = await this.classGroupRepository.findOne({
        where: {
          courseSemesterId: existingGroup.courseSemesterId,
          groupNumber: groupNumber,
          id: Not(id),
        },
      });
      if (conflict) {
        throw new ConflictException(
          `Group number ${groupNumber} already exists for CourseSemester ID ${existingGroup.courseSemesterId}.`,
        );
      }
      existingGroup.groupNumber = groupNumber;
    }

    if (
      maxStudents !== undefined &&
      maxStudents < existingGroup.registeredStudents
    ) {
      throw new BadRequestException(
        `Cannot set maxStudents (${maxStudents}) lower than current registered students (${existingGroup.registeredStudents}).`,
      );
    }
    if (
      registeredStudents !== undefined &&
      maxStudents !== undefined &&
      registeredStudents > maxStudents
    ) {
      throw new BadRequestException(
        `Cannot set registeredStudents (${registeredStudents}) higher than maxStudents (${maxStudents}).`,
      );
    }
    if (
      registeredStudents !== undefined &&
      registeredStudents > existingGroup.maxStudents &&
      maxStudents === undefined
    ) {
      throw new BadRequestException(
        `Cannot set registeredStudents (${registeredStudents}) higher than maxStudents (${existingGroup.maxStudents}).`,
      );
    }

    Object.assign(existingGroup, restUpdateData);
    if (maxStudents !== undefined) existingGroup.maxStudents = maxStudents;
    if (registeredStudents !== undefined)
      existingGroup.registeredStudents = registeredStudents;

    return this.classGroupRepository.save(existingGroup);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);

    if (group.registeredStudents > 0) {
      throw new BadRequestException(
        `Cannot delete group ID ${id} because it has registered students. Consider changing its status to CANCELLED.`,
      );
    }

    await this.classGroupRepository.delete(id);
  }

  async incrementRegistered(id: number, count = 1): Promise<ClassGroupEntity> {
    const group = await this.findOne(id);
    if (group.status !== EClassGroupStatus.OPEN) {
      throw new BadRequestException(
        `ClassGroup ID ${id} is not open for registration (status: ${group.status}).`,
      );
    }
    if (group.registeredStudents + count > group.maxStudents) {
      throw new BadRequestException(
        `Cannot register. ClassGroup ID ${id} is full (${group.registeredStudents}/${group.maxStudents}).`,
      );
    }
    group.registeredStudents += count;
    // Có thể thêm logic đóng nhóm tự động nếu đủ SV
    // if (group.registeredStudents === group.maxStudents) {
    //     group.status = EClassGroupStatus.CLOSED;
    // }
    return this.classGroupRepository.save(group);
  }

  async decrementRegistered(id: number, count = 1): Promise<ClassGroupEntity> {
    const group = await this.findOne(id);
    if (group.registeredStudents - count < 0) {
      throw new BadRequestException(
        `Cannot decrement. Registered students cannot be negative for ClassGroup ID ${id}.`,
      );
    }
    group.registeredStudents -= count;
    // Có thể thêm logic mở lại nhóm nếu SV hủy đăng ký
    // if(group.status === EClassGroupStatus.CLOSED && group.registeredStudents < group.maxStudents) {
    //     group.status = EClassGroupStatus.OPEN;
    // }
    return this.classGroupRepository.save(group);
  }

  async updateStatus(
    id: number,
    status: EClassGroupStatus,
  ): Promise<ClassGroupEntity> {
    const group = await this.findOne(id);
    // Thêm các quy tắc chuyển trạng thái nếu cần
    // Ví dụ: không cho chuyển từ CANCELLED sang OPEN
    group.status = status;
    return this.classGroupRepository.save(group);
  }
}
