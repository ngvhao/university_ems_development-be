import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { LecturerEntity } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dtos/createLecturer.dto';
import { UpdateLecturerDto } from './dtos/updateLecturer.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { DepartmentEntity } from '../department/entities/department.entity';
import { UserService } from '../user/user.service';
import { Helpers } from 'src/utils/helpers';
import { UserEntity } from '../user/entities/user.entity';
import { EAccountStatus, EUserRole } from 'src/utils/enums/user.enum';
import _ from 'lodash';
import { DEFAULT_PAGINATION } from 'src/utils/constants';
import { ClassEntity } from '../class/entities/class.entity';
import { ClassGroupEntity } from '../class_group/entities/class_group.entity';

@Injectable()
export class LecturerService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LecturerEntity)
    private readonly lecturerRepository: Repository<LecturerEntity>,
    private readonly userService: UserService,
  ) {}

  async create(
    createLecturerDto: CreateLecturerDto,
  ): Promise<Partial<LecturerEntity>> {
    const {
      personalEmail,
      firstName,
      lastName,
      avatarUrl,
      phoneNumber,
      identityCardNumber,
      dateOfBirth,
      gender,
      hometown,
      permanentAddress,
      temporaryAddress,
      nationality,
      ethnicity,
      universityEmail,
      departmentId,
      specialization,
      academicRank,
      isHeadDepartment,
    } = createLecturerDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const existingPersonal =
      //   await this.userService.getUserByPersonalEmail(personalEmail);
      // if (existingPersonal.length > 0) {
      //   throw new ConflictException(
      //     `Email cá nhân '${personalEmail}' đã được sử dụng.`,
      //   );
      // }

      const department = await queryRunner.manager.findOne(DepartmentEntity, {
        where: { id: departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Không tìm thấy bộ môn với ID ${departmentId}`,
        );
      }

      const existingUniEmail =
        await this.userService.getUserByUniEmail(universityEmail);
      if (existingUniEmail) {
        throw new ConflictException(
          `Email trường cấp '${universityEmail}' được đã được liên kết trước đó.`,
        );
      }

      const hashedPassword = await Helpers.hashPassword({
        password: identityCardNumber,
      });

      const userToCreate: Partial<UserEntity> = {
        personalEmail,
        universityEmail: universityEmail,
        password: hashedPassword,
        firstName,
        lastName,
        role: EUserRole.LECTURER,
        avatarUrl,
        phoneNumber,
        identityCardNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        hometown,
        permanentAddress,
        temporaryAddress,
        nationality,
        ethnicity,
        isActive: EAccountStatus.ACTIVE,
      };
      const savedUser = await queryRunner.manager.save(
        UserEntity,
        userToCreate,
      );

      console.log(savedUser);

      const lecturerToCreate: Partial<LecturerEntity> = {
        userId: savedUser.id,
        academicRank,
        departmentId,
        isHeadDepartment,
        specialization,
      };
      await queryRunner.manager.save(LecturerEntity, lecturerToCreate);

      await queryRunner.commitTransaction();

      return _.omit(lecturerToCreate);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Lỗi khi tạo giảng viên:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi không mong muốn khi tạo giảng viên.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllLecturersId(): Promise<{ lecturerId: number }[]> {
    const data = await this.lecturerRepository.find({
      select: {
        id: true,
      },
    });
    return data.map((lecturer) => {
      return { lecturerId: lecturer.id };
    });
  }

  async findAll(
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: LecturerEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.lecturerRepository.findAndCount({
      relations: ['user', 'department'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<LecturerEntity> {
    const lecturer = await this.lecturerRepository.findOne({
      where: { id },
      relations: ['user', 'department'],
    });
    if (!lecturer) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
    return lecturer;
  }

  async getOne(
    condition:
      | FindOptionsWhere<LecturerEntity>
      | FindOptionsWhere<LecturerEntity>[],
    relations?: FindOptionsRelations<LecturerEntity>,
  ): Promise<LecturerEntity> {
    const lecturer = await this.lecturerRepository.findOne({
      where: condition,
      relations: relations,
    });
    if (!lecturer) {
      throw new NotFoundException(`Lecturer not found`);
    }
    return lecturer;
  }

  async update(
    id: number,
    updateLecturerDto: UpdateLecturerDto,
  ): Promise<LecturerEntity> {
    const lecture = await this.findOne(id);
    Object.assign(lecture, updateLecturerDto);
    return this.lecturerRepository.save(lecture);
  }

  async remove(id: number): Promise<void> {
    await this.lecturerRepository.delete(id);
  }

  async getLecturerCountByDepartmentId(departmentId: number): Promise<number> {
    const lecturerCount = await this.lecturerRepository.count({
      where: { departmentId: departmentId },
    });
    return lecturerCount;
  }

  /**
   * Lấy danh sách lớp cố vấn của giảng viên
   * @param lecturerId - ID của giảng viên
   * @param paginationDto - Tham số phân trang
   * @returns Danh sách lớp cố vấn và thông tin phân trang
   */
  async getAdvisoryClasses(
    lecturerId: number,
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: ClassEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.dataSource
      .getRepository(ClassEntity)
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.major', 'major')
      .leftJoinAndSelect('major.department', 'department')
      .leftJoinAndSelect('class.students', 'students')
      .leftJoinAndSelect('students.user', 'user')
      .where('class.homeroomLecturerId = :lecturerId', { lecturerId });

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('class.createdAt', 'DESC')
      .getMany();

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  /**
   * Lấy danh sách nhóm lớp đang giảng dạy của giảng viên
   * @param lecturerId - ID của giảng viên
   * @param paginationDto - Tham số phân trang
   * @returns Danh sách nhóm lớp đang giảng dạy và thông tin phân trang
   */
  async getTeachingClasses(
    lecturerId: number,
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: ClassGroupEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.dataSource
      .getRepository(ClassGroupEntity)
      .createQueryBuilder('classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('classGroup.semester', 'semester')
      .leftJoinAndSelect('classGroup.enrollments', 'enrollments')
      .leftJoinAndSelect('enrollments.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .where('classGroup.lecturerId = :lecturerId', { lecturerId });

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('classGroup.createdAt', 'DESC')
      .getMany();

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }
}
