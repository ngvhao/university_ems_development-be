import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentService } from 'src/modules/student/student.service';
import { EUserRole } from 'src/utils/enums/user.enum';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { FilterEnrollmentCourseDto } from './dtos/filterEnrollmentCourse.dto';
import { UserEntity } from '../user/entities/user.entity';
import { ClassGroupEntity } from '../class_group/entities/class_group.entity';

@Injectable()
export class EnrollmentCourseService {
  constructor(
    @InjectRepository(EnrollmentCourseEntity)
    private readonly enrollmentRepository: Repository<EnrollmentCourseEntity>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
  ) {}

  /**
   * Helper: Tìm Enrollment theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của Enrollment.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<EnrollmentCourseEntity> - Enrollment tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  private async findEnrollmentByIdOrThrow(
    id: number,
    relations?: string[],
  ): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations,
    });
    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy lượt đăng ký với ID ${id}`);
    }
    return enrollment;
  }

  /**
   * Helper: Kiểm tra quyền truy cập enrollment của người dùng hiện tại.
   * @param enrollment - Bản ghi enrollment cần kiểm tra.
   * @param currentUser - Thông tin người dùng hiện tại.
   * @throws ForbiddenException nếu không có quyền.
   */
  private async checkEnrollmentAccessPermission(
    enrollment: EnrollmentCourseEntity,
    currentUser: UserEntity,
  ): Promise<void> {
    if (!currentUser) {
      throw new ForbiddenException('Hành động yêu cầu xác thực.');
    }

    if (
      [EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
        currentUser.role,
      )
    ) {
      return;
    }
    if (currentUser.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.findOneById(
        currentUser.id,
      );
      if (!studentProfile || enrollment.studentId !== studentProfile.id) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập lượt đăng ký này.',
        );
      }
      return;
    }
    throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
  }

  /**
   * Tạo một lượt đăng ký môn học mới.
   * @param createDto - Dữ liệu đăng ký.
   * @param currentUser - Thông tin người dùng thực hiện hành động.
   * @returns Promise<EnrollmentCourseEntity> - Lượt đăng ký vừa tạo.
   * @throws BadRequestException nếu thiếu studentId (khi admin/manager tạo) hoặc lớp không mở/đã đầy.
   * @throws ForbiddenException nếu không có quyền hoặc user không có profile student.
   * @throws ConflictException nếu sinh viên đã đăng ký lớp này rồi.
   * @throws NotFoundException nếu ClassGroup hoặc Student (nếu studentId được cung cấp) không tồn tại.
   */
  async create(
    createDto: CreateEnrollmentCourseDto,
    currentUser: UserEntity,
  ): Promise<EnrollmentCourseEntity> {
    const { classGroupIds } = createDto;
    let studentId = createDto.studentId;
    let majorId = null;
    let startAcademicYear = null;

    if (!studentId) {
      // Trường hợp student tự đăng ký
      if (currentUser.role !== EUserRole.STUDENT) {
        throw new ForbiddenException('Chỉ sinh viên mới có thể tự đăng ký.');
      }
      const studentProfile = await this.studentService.findOneById(
        currentUser.id,
      );
      if (!studentProfile) {
        throw new ForbiddenException(
          'Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên.',
        );
      }
      majorId = studentProfile.majorId;
      startAcademicYear = studentProfile.academicYear;
      studentId = studentProfile.id;
    } else {
      // Trường hợp admin/manager đăng ký cho sinh viên
      if (
        ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
          currentUser.role,
        )
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền đăng ký cho sinh viên khác.',
        );
      }
      // Kiểm tra studentId được cung cấp có tồn tại không
      const studentProfile = await this.studentService.findOneById(studentId);
      console.log('studentProfile@create: ', studentProfile);
      majorId = studentProfile.majorId;
      startAcademicYear = studentProfile.academicYear;
    }
    for (const classGroupId of classGroupIds) {
      // --- Bắt đầu Transaction ---
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Lock ClassGroup để tránh race condition khi kiểm tra và cập nhật số lượng
        const classGroup = await queryRunner.manager.findOne(ClassGroupEntity, {
          where: {
            id: classGroupId,
            course: {
              curriculumCourses: {
                curriculum: {
                  majorId: majorId,
                  startAcademicYear: startAcademicYear,
                },
              },
            },
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!classGroup) {
          throw new NotFoundException(
            `Không tìm thấy Nhóm lớp học với ID ${classGroupId}`,
          );
        }

        // Kiểm tra trạng thái và số lượng chỗ trống của ClassGroup
        if (classGroup.status !== EClassGroupStatus.OPEN_FOR_REGISTER) {
          throw new BadRequestException(
            `Nhóm lớp học ID ${classGroupId} không mở để đăng ký (trạng thái: ${classGroup.status}).`,
          );
        }
        if (classGroup.registeredStudents >= classGroup.maxStudents) {
          throw new BadRequestException(
            `Nhóm lớp học ID ${classGroupId} đã đầy (${classGroup.registeredStudents}/${classGroup.maxStudents}).`,
          );
        }

        // Kiểm tra sinh viên đã đăng ký nhóm này chưa
        const existingEnrollment = await queryRunner.manager.findOne(
          EnrollmentCourseEntity,
          {
            where: {
              studentId,
              classGroupId,
              status: EEnrollmentStatus.ENROLLED,
            },
            select: ['id'],
          },
        );
        if (existingEnrollment) {
          throw new ConflictException(
            `Sinh viên ID ${studentId} đã đăng ký Nhóm lớp học ID ${classGroupId}.`,
          );
        }

        // Tạo bản ghi Enrollment mới
        const newEnrollmentData = {
          studentId,
          classGroupId,
          status: EEnrollmentStatus.ENROLLED,
        };
        const newEnrollment = queryRunner.manager.create(
          EnrollmentCourseEntity,
          newEnrollmentData,
        );
        const savedEnrollment = await queryRunner.manager.save(newEnrollment);

        // Tăng số lượng sinh viên đã đăng ký trong ClassGroup
        await queryRunner.manager.update(ClassGroupEntity, classGroupId, {
          registeredStudents: () => `"registeredStudents" + 1`,
        });
        // Cập nhật trạng thái lớp
        if (classGroup.registeredStudents + 1 === classGroup.maxStudents) {
          await queryRunner.manager.update(ClassGroupEntity, classGroupId, {
            status: EClassGroupStatus.CLOSED_FOR_REGISTER,
          });
        }

        await queryRunner.commitTransaction();

        return this.findEnrollmentByIdOrThrow(savedEnrollment.id, [
          'student',
          'classGroup',
        ]);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (
          error instanceof ConflictException ||
          (error.code === '23505' &&
            error.detail?.includes('(studentId, classGroupId)'))
        ) {
          throw new ConflictException(
            `Sinh viên ID ${studentId} có thể đã đăng ký Nhóm lớp học ID ${classGroupId}.`,
          );
        }
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findEnrollmentNumberBySemester(
    semesterCode: string,
    studentId: number,
  ): Promise<number> {
    const [_enrollments, number] = await this.enrollmentRepository.findAndCount(
      {
        where: {
          studentId: studentId,
          classGroup: {
            semester: {
              semesterCode: semesterCode,
            },
          },
          status: EEnrollmentStatus.ENROLLED,
        },
      },
    );
    return number;
  }

  /**
   * Lấy danh sách các lượt đăng ký .
   * Áp dụng tự động lọc theo sinh viên nếu người dùng là STUDENT.
   * @param paginationDto - Thông tin phân trang.
   * @param filterDto - Thông tin lọc.
   * @param currentUser - Thông tin người dùng hiện tại (để phân quyền).
   * @returns Promise<{ data: EnrollmentCourseEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    filterDto: FilterEnrollmentCourseDto,
    currentUser: UserEntity,
  ): Promise<{ data: EnrollmentCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { classGroupId, status, semesterId } = filterDto;
    let { studentId } = filterDto;

    const where: FindOptionsWhere<EnrollmentCourseEntity> = {};

    if (currentUser.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.findOneById(
        currentUser.id,
      );
      if (!studentProfile) {
        return { data: [], meta: generatePaginationMeta(0, page, limit) };
      }

      if (!studentId) {
        studentId = studentProfile.id;
      } else if (studentId !== studentProfile.id) {
        throw new ForbiddenException(
          'Sinh viên chỉ được xem đăng ký của chính mình.',
        );
      }
      where.studentId = studentId;
    } else if (
      [EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
        currentUser.role,
      )
    ) {
      if (studentId) {
        where.studentId = studentId;
      }
    } else {
      return { data: [], meta: generatePaginationMeta(0, page, limit) };
    }

    if (classGroupId) {
      where.classGroupId = classGroupId;
    }
    if (status) {
      where.status = status;
    }
    if (semesterId) {
      where.classGroup = {
        semesterId: semesterId,
      };
    }
    // Query dữ liệu
    const [data, total] = await this.enrollmentRepository.findAndCount({
      where,
      relations: {
        classGroup: {
          course: true,
          semester: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { enrollmentDate: 'DESC' },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một lượt đăng ký theo ID.
   * Kiểm tra quyền truy cập của người dùng hiện tại.
   * @param id - ID của lượt đăng ký.
   * @param currentUser - Thông tin người dùng hiện tại.
   * @returns Promise<EnrollmentCourseEntity> - Thông tin chi tiết.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws ForbiddenException nếu không có quyền xem.
   */
  async findOne(
    id: number,
    currentUser: UserEntity,
  ): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.findEnrollmentByIdOrThrow(id, [
      'student',
      'classGroup',
      'classGroup.courseSemester',
      'classGroup.courseSemester.course',
      'classGroup.courseSemester.semester',
    ]);

    await this.checkEnrollmentAccessPermission(enrollment, currentUser);

    return enrollment;
  }

  async findOneById(id: number): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.findEnrollmentByIdOrThrow(id);
    return enrollment;
  }

  /**
   * Hủy một lượt đăng ký môn học (chuyển trạng thái sang CANCELLED).
   * @param id - ID của lượt đăng ký cần hủy.
   * @param currentUser - Thông tin người dùng thực hiện.
   * @returns Promise<EnrollmentCourseEntity> - Lượt đăng ký sau khi đã hủy.
   * @throws NotFoundException nếu không tìm thấy lượt đăng ký.
   * @throws ForbiddenException nếu không có quyền hủy.
   * @throws BadRequestException nếu lượt đăng ký đã bị hủy hoặc lớp đã bị khóa.
   */
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
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!enrollment) {
        throw new NotFoundException(`Không tìm thấy lượt đăng ký với ID ${id}`);
      }

      await this.checkEnrollmentAccessPermission(enrollment, currentUser);

      if (enrollment.status === EEnrollmentStatus.CANCELLED) {
        throw new BadRequestException(
          `Lượt đăng ký ID ${id} đã bị hủy trước đó.`,
        );
      }

      const classGroup = await queryRunner.manager.findOne(ClassGroupEntity, {
        where: { id: enrollment.classGroupId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!classGroup) {
        throw new InternalServerErrorException(
          `Không tìm thấy ClassGroup ID ${enrollment.classGroupId} liên kết với Enrollment ID ${id}.`,
        );
      }

      if (
        classGroup.status === EClassGroupStatus.LOCKED ||
        classGroup.status === EClassGroupStatus.CANCELLED
      ) {
        throw new BadRequestException(
          `Không thể hủy đăng ký vì Nhóm lớp học (ID: ${enrollment.classGroupId}) đã bị khóa hoặc hủy.`,
        );
      }

      enrollment.status = EEnrollmentStatus.CANCELLED;
      const updatedEnrollment = await queryRunner.manager.save(
        EnrollmentCourseEntity,
        enrollment,
      );

      await queryRunner.manager.update(
        ClassGroupEntity,
        enrollment.classGroupId,
        {
          registeredStudents: () => `"registeredStudents" - 1`,
        },
      );

      await queryRunner.commitTransaction();

      return updatedEnrollment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * [Admin Only] Xóa vĩnh viễn một lượt đăng ký.
   * @param id - ID của lượt đăng ký cần xóa.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async hardRemove(id: number): Promise<void> {
    const enrollment = await this.findEnrollmentByIdOrThrow(id);
    await this.enrollmentRepository.remove(enrollment);
  }
}
