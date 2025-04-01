import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindManyOptions } from 'typeorm';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentService } from 'src/modules/student/student.service';
import { ClassGroupService } from 'src/modules/class_group/class_group.service';

import { EUserRole } from 'src/utils/enums/user.enum';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { FilterEnrollmentCourseDto } from './dtos/filterEnrollmentCourse.dto';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class EnrollmentCourseService {
  constructor(
    @InjectRepository(EnrollmentCourseEntity)
    private readonly enrollmentRepository: Repository<EnrollmentCourseEntity>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => ClassGroupService))
    private readonly classGroupService: ClassGroupService,
  ) {}

  async create(
    createDto: CreateEnrollmentCourseDto,
    currentUser: UserEntity,
  ): Promise<EnrollmentCourseEntity> {
    const { classGroupId } = createDto;
    let studentId = createDto.studentId;

    // Xác định studentId: Ưu tiên studentId từ DTO (nếu là admin/manager), nếu không thì lấy từ currentUser (nếu là student)
    if (!studentId) {
      if (currentUser.role !== EUserRole.STUDENT) {
        throw new BadRequestException(
          'studentId is required when enrolling by admin/manager.',
        );
      }
      const { id: studentIdExist } = await this.studentService.getOne({
        user: { id: currentUser.id },
      });
      if (!studentIdExist) {
        throw new ForbiddenException(
          'User does not have a linked student profile.',
        );
      }
      studentId = studentIdExist;
    } else {
      if (
        currentUser.role !== EUserRole.STUDENT &&
        ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
          currentUser.role,
        )
      ) {
        throw new ForbiddenException(
          'Insufficient permissions to enroll other students.',
        );
      }
    }

    // --- Bắt đầu Transaction ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra ClassGroup tồn tại và trạng thái
      const classGroup = await this.classGroupService.findOne(classGroupId); // findOne đã bao gồm kiểm tra tồn tại
      if (classGroup.status !== EClassGroupStatus.OPEN) {
        throw new BadRequestException(
          `Class Group ID ${classGroupId} is not open for enrollment (status: ${classGroup.status}).`,
        );
      }

      // 2. Kiểm tra số lượng chỗ trống
      if (classGroup.registeredStudents >= classGroup.maxStudents) {
        throw new BadRequestException(
          `Class Group ID ${classGroupId} is full (${classGroup.registeredStudents}/${classGroup.maxStudents}).`,
        );
      }

      // 3. Kiểm tra sinh viên đã đăng ký nhóm này chưa (trạng thái ENROLLED)
      const existingEnrollment = await queryRunner.manager.findOne(
        EnrollmentCourseEntity,
        {
          where: {
            studentId,
            classGroupId,
            status: EEnrollmentStatus.ENROLLED,
          },
        },
      );
      if (existingEnrollment) {
        throw new ConflictException(
          `Student ID ${studentId} is already enrolled in Class Group ID ${classGroupId}.`,
        );
      }

      // 4. Tạo bản ghi Enrollment mới (hoặc cập nhật nếu đã CANCELLED trước đó - tùy logic)
      // Ví dụ: Luôn tạo mới theo unique constraint
      const newEnrollment = queryRunner.manager.create(EnrollmentCourseEntity, {
        studentId,
        classGroupId,
        status: createDto.status || EEnrollmentStatus.ENROLLED, // Mặc định là ENROLLED
      });
      const savedEnrollment = await queryRunner.manager.save(newEnrollment);

      // 5. Tăng số lượng sinh viên đã đăng ký trong ClassGroup
      await this.classGroupService.incrementRegistered(classGroupId, 1); // Dùng hàm đã có trong ClassGroupService

      // --- Commit Transaction ---
      await queryRunner.commitTransaction();
      return savedEnrollment; // Trả về bản ghi enrollment đã lưu
    } catch (error) {
      // --- Rollback Transaction ---
      await queryRunner.rollbackTransaction();
      // Rethrow lỗi để controller xử lý
      throw error;
    } finally {
      // --- Release Query Runner ---
      await queryRunner.release();
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterEnrollmentCourseDto,
    currentUser?: UserEntity,
  ): Promise<{ data: EnrollmentCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { studentId, classGroupId, status } = filterDto;

    const where: FindManyOptions<EnrollmentCourseEntity>['where'] = {};

    // Nếu người dùng là sinh viên và không có studentId filter, chỉ hiển thị của họ
    if (currentUser?.role === EUserRole.STUDENT && !studentId) {
      const { id: studentIdExist } = await this.studentService.getOne({
        user: { id: currentUser.id },
      });
      // TODO: Lấy studentId từ currentUser.id hoặc currentUser.studentId
      where.studentId = studentIdExist; // Giả sử có studentId trong IUser
    } else if (studentId) {
      // Nếu là admin/manager hoặc student xem của chính mình (đã check ở controller)
      where.studentId = studentId;
    }

    if (classGroupId) {
      where.classGroupId = classGroupId;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.enrollmentRepository.findAndCount({
      where,
      relations: [
        'student',
        'classGroup',
        'classGroup.courseSemester',
        'classGroup.courseSemester.course',
        'classGroup.courseSemester.semester',
      ], // Load nhiều thông tin hơn
      skip: (page - 1) * limit,
      take: limit,
      order: { enrollmentDate: 'DESC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findOne(
    id: number,
    currentUser?: UserEntity,
  ): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'classGroup'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    // Authorization: Student chỉ xem được enrollment của mình
    const { id: studentIdExist } = await this.studentService.getOne({
      user: { id: currentUser.id },
    });
    if (
      currentUser?.role === EUserRole.STUDENT &&
      enrollment.studentId !== studentIdExist
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this enrollment.',
      );
    }

    return enrollment;
  }

  async cancel(
    id: number,
    currentUser: UserEntity,
  ): Promise<EnrollmentCourseEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollment = await queryRunner.manager.findOne(
        EnrollmentCourseEntity,
        {
          where: { id },
          relations: ['classGroup'],
        },
      );

      if (!enrollment) {
        throw new NotFoundException(`Enrollment with ID ${id} not found`);
      }
      const { id: studentIdExist } = await this.studentService.getOne({
        user: { id: currentUser.id },
      });
      if (
        currentUser.role === EUserRole.STUDENT &&
        enrollment.studentId !== studentIdExist
      ) {
        throw new ForbiddenException(
          'You are not authorized to cancel this enrollment.',
        );
      }
      if (
        currentUser.role !== EUserRole.STUDENT &&
        ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
          currentUser.role,
        )
      ) {
        throw new ForbiddenException(
          'Insufficient permissions to cancel this enrollment.',
        );
      }

      if (enrollment.status === EEnrollmentStatus.CANCELLED) {
        throw new BadRequestException(
          `Enrollment ID ${id} is already cancelled.`,
        );
      }

      // Kiểm tra trạng thái lớp học có cho phép hủy không (ví dụ: không cho hủy khi lớp đã LOCK)
      if (enrollment.classGroup.status === EClassGroupStatus.LOCKED) {
        throw new BadRequestException(
          `Cannot cancel enrollment because the class group (ID: ${enrollment.classGroupId}) is locked.`,
        );
      }

      // 1. Cập nhật trạng thái Enrollment thành CANCELLED
      enrollment.status = EEnrollmentStatus.CANCELLED;
      const updatedEnrollment = await queryRunner.manager.save(enrollment);

      // 2. Giảm số lượng sinh viên đã đăng ký trong ClassGroup
      // Chỉ giảm nếu trạng thái trước đó là ENROLLED (có thể có các trạng thái khác trong tương lai)
      // Hàm decrementRegistered cần được điều chỉnh để chỉ giảm khi cần thiết, hoặc kiểm tra ở đây
      await this.classGroupService.decrementRegistered(
        enrollment.classGroupId,
        1,
      );

      // --- Commit Transaction ---
      await queryRunner.commitTransaction();
      return updatedEnrollment;
    } catch (error) {
      // --- Rollback Transaction ---
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // --- Release Query Runner ---
      await queryRunner.release();
    }
  }
}
