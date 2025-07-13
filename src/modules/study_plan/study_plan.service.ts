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
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Not,
  In,
  DataSource,
  FindOptionsOrder,
  Between,
} from 'typeorm';
import { CreateStudyPlanDto } from './dtos/createStudyPlan.dto';
import { UpdateStudyPlanDto } from './dtos/updateStudyPlan.dto';
import { StudyPlanEntity } from './entities/study_plan.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { StudentService } from '../student/student.service';
import { SemesterService } from '../semester/semester.service';
import { CourseService } from '../course/course.service';
import { UserEntity } from '../user/entities/user.entity';
import { EUserRole } from 'src/utils/enums/user.enum';
import { FilterStudyPlanDto } from './dtos/filterStudyPlan.dto';
import { EStudyPlanStatus } from 'src/utils/enums/study-plan.enum';
import { StudentEntity } from '../student/entities/student.entity';
import { CourseEntity } from '../course/entities/course.entity';
import { LecturerCourseService } from '../lecturer_course/lecturer_course.service';
import { CourseSchedulingInfoDTO } from './dtos/courseScheduling.dto';
import { CourseHelper } from 'src/utils/helpers/course.helper';
import { DEFAULT_PAGINATION } from 'src/utils/constants';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(StudyPlanEntity)
    private readonly studyPlanRepository: Repository<StudyPlanEntity>,
    @Inject(forwardRef(() => StudentService))
    private readonly studentService: StudentService,
    @Inject(forwardRef(() => SemesterService))
    private readonly semesterService: SemesterService,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    private readonly lecturerCourseService: LecturerCourseService,
  ) {}

  /**
   * Helper: Tìm Kế hoạch học tập theo ID, ném lỗi nếu không tìm thấy.
   * @param id - ID của StudyPlan.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<StudyPlanEntity> - StudyPlan tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(id: number, relations?: string[]): Promise<StudyPlanEntity> {
    const relationsToLoad = relations ?? ['student', 'semester', 'course'];
    const studyPlan = await this.studyPlanRepository.findOne({
      where: { id },
      relations: relationsToLoad,
    });
    if (!studyPlan) {
      throw new NotFoundException(
        `Không tìm thấy Kế hoạch học tập với ID ${id}`,
      );
    }
    return studyPlan;
  }

  /**
   * Helper: Tìm Kế hoạch học tập theo ID và kiểm tra quyền truy cập, ném lỗi nếu không tìm thấy hoặc không có quyền.
   * @param id - ID của StudyPlan.
   * @param currentUser - Người dùng hiện tại.
   * @param relations - Các mối quan hệ cần load.
   * @returns Promise<StudyPlanEntity> - StudyPlan tìm được.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws ForbiddenException nếu không có quyền truy cập.
   */
  async findOneWithAuth(
    id: number,
    currentUser: UserEntity,
    relations?: string[],
  ): Promise<StudyPlanEntity> {
    const studyPlan = await this.findOne(id, relations);
    await this.checkAccessPermission(studyPlan, currentUser);
    return studyPlan;
  }

  /**
   * Helper: Kiểm tra xem sinh viên đã có kế hoạch cho môn học này trong học kỳ này chưa.
   * @param studentId - ID Sinh viên.
   * @param semesterId - ID Học kỳ.
   * @param courseId - ID Môn học.
   * @param excludeId - (Optional) ID bản ghi cần loại trừ (khi cập nhật).
   * @throws ConflictException nếu đã tồn tại.
   */
  private async checkConflict(
    studentId: number,
    semesterId: number,
    courseId: number,
    excludeId?: number,
  ): Promise<void> {
    const where: FindOptionsWhere<StudyPlanEntity> = {
      studentId,
      semesterId,
      courseId,
    };
    if (excludeId) {
      where.id = Not(excludeId);
    }
    const existing = await this.studyPlanRepository.findOne({
      where,
      select: ['id'],
    });
    if (existing) {
      throw new ConflictException(
        `Sinh viên ID ${studentId} đã có kế hoạch học Môn học ID ${courseId} trong Học kỳ ID ${semesterId} (ID: ${existing.id}).`,
      );
    }
  }

  /**
   * Helper: Kiểm tra quyền truy cập StudyPlan của người dùng hiện tại.
   * @param studyPlan - Bản ghi StudyPlan cần kiểm tra.
   * @param currentUser - Thông tin người dùng hiện tại.
   * @throws ForbiddenException nếu không có quyền.
   */
  private async checkAccessPermission(
    studyPlan: StudyPlanEntity,
    currentUser: UserEntity,
  ): Promise<void> {
    if (!currentUser)
      throw new ForbiddenException('Hành động yêu cầu xác thực.');
    if (
      [EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
        currentUser.role,
      )
    )
      return;
    if (currentUser.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.getOne({
        userId: currentUser.id,
      });
      if (!studentProfile || studyPlan.studentId !== studentProfile.id) {
        throw new ForbiddenException(
          'Bạn chỉ có quyền truy cập kế hoạch học tập của chính mình.',
        );
      }
      return;
    }
    throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
  }

  /**
   * Tạo một mục mới trong kế hoạch học tập với status mặc định là PLANNED.
   * Hoặc cập nhật status thành PLANNED nếu đã tồn tại nhưng không phải PLANNED.
   * @param createStudyPlanDto - Dữ liệu tạo kế hoạch.
   * @param currentUser - Thông tin người dùng thực hiện.
   * @param registerSemesterId - ID học kỳ đăng ký.
   * @returns Promise<StudyPlanEntity[]> - Danh sách các mục kế hoạch vừa tạo/cập nhật.
   * @throws ForbiddenException nếu user không có quyền hoặc không phải là SV tương ứng.
   * @throws NotFoundException nếu Student, Semester hoặc Course không tồn tại.
   * @throws BadRequestException nếu có lỗi validation hoặc xung đột không hoàn toàn.
   * @throws ConflictException nếu không thể tạo bất kỳ kế hoạch nào do xung đột.
   */
  async create(
    createStudyPlanDto: CreateStudyPlanDto,
    currentUser: UserEntity,
    registerSemesterId: number,
  ): Promise<StudyPlanEntity[]> {
    const { courseIds } = createStudyPlanDto;
    let { studentId } = createStudyPlanDto;

    // 1. Kiểm tra quyền và xác định studentId
    if (!studentId) {
      if (currentUser.role !== EUserRole.STUDENT) {
        throw new ForbiddenException(
          'Chỉ sinh viên mới có thể tự tạo kế hoạch học tập cho mình.',
        );
      }
      const studentProfile = await this.studentService.getOne({
        userId: currentUser.id,
      });
      if (!studentProfile) {
        throw new ForbiddenException(
          'Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên.',
        );
      }
      studentId = studentProfile.id;
    } else {
      if (
        ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
          currentUser.role,
        )
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền tạo kế hoạch học tập cho sinh viên khác.',
        );
      }
      // Đảm bảo studentId tồn tại
      await this.studentService.getOne({
        id: studentId,
      });
    }

    // 2. Kiểm tra tồn tại Semester và Courses
    const [semester, courses] = await Promise.all([
      this.semesterService.findOne(registerSemesterId),
      Promise.all(courseIds.map((id) => this.courseService.findOne(id))),
    ]);

    if (!semester) {
      throw new NotFoundException(
        `Học kỳ với ID ${registerSemesterId} không tồn tại.`,
      );
    }

    const existingCourses = courses.filter(Boolean);
    if (existingCourses.length !== courseIds.length) {
      const missingCourseIds = courseIds.filter(
        (id) => !existingCourses.some((c) => c.id === id),
      );
      throw new NotFoundException(
        `Một hoặc nhiều môn học với ID [${missingCourseIds.join(
          ', ',
        )}] không tồn tại.`,
      );
    }

    // 3. Thực hiện tạo/cập nhật trong Transaction
    const createdOrUpdatedStudyPlanIds: number[] = [];
    const conflictMessages: string[] = [];

    // Bắt đầu một giao dịch để đảm bảo tính toàn vẹn dữ liệu
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      for (const course of existingCourses) {
        // Lặp qua các Course Entity đã tìm thấy
        const courseId = course.id;
        try {
          // 3.1. Kiểm tra xung đột/Tồn tại
          const existingStudyPlan = await transactionalEntityManager.findOne(
            StudyPlanEntity,
            {
              where: {
                studentId,
                semesterId: registerSemesterId,
                courseId,
              },
            },
          );

          if (existingStudyPlan) {
            // Kế hoạch đã tồn tại
            if (existingStudyPlan.status !== EStudyPlanStatus.PLANNED) {
              // Cập nhật trạng thái thành PLANNED nếu chưa phải
              existingStudyPlan.status = EStudyPlanStatus.PLANNED;
              await transactionalEntityManager.save(existingStudyPlan);
              createdOrUpdatedStudyPlanIds.push(existingStudyPlan.id);
            } else {
              // Nếu đã tồn tại và status đã là PLANNED, coi là xung đột không cần cập nhật
              conflictMessages.push(
                `Môn học ID ${courseId}: Kế hoạch đã tồn tại và đang ở trạng thái PLANNED.`,
              );
            }
          } else {
            // Tạo mới kế hoạch học tập
            const newStudyPlan = transactionalEntityManager.create(
              StudyPlanEntity,
              {
                studentId,
                semesterId: registerSemesterId,
                courseId,
                status: EStudyPlanStatus.PLANNED,
              },
            );
            const savedPlan =
              await transactionalEntityManager.save(newStudyPlan);
            createdOrUpdatedStudyPlanIds.push(savedPlan.id);
          }
        } catch (error) {
          if (error.code === '23505') {
            conflictMessages.push(
              `Môn học ID ${courseId}: Sinh viên ID ${studentId} đã có kế hoạch học môn này trong Học kỳ ID ${registerSemesterId}.`,
            );
          } else if (error instanceof ConflictException) {
            conflictMessages.push(`Môn học ID ${courseId}: ${error.message}`);
          } else {
            console.error(
              `Lỗi khi tạo/cập nhật kế hoạch học tập cho Môn học ID ${courseId}:`,
              error,
            );
            conflictMessages.push(
              `Môn học ID ${courseId}: Không thể tạo/cập nhật kế hoạch học tập do lỗi không xác định.`,
            );
          }
        }
      }
    });

    // 4. Xử lý kết quả và phản hồi lỗi
    if (conflictMessages.length > 0) {
      if (createdOrUpdatedStudyPlanIds.length > 0) {
        const successfulStudyPlans = await this.studyPlanRepository.find({
          where: { id: In(createdOrUpdatedStudyPlanIds) },
          relations: ['student', 'semester', 'course'],
        });
        throw new BadRequestException({
          message:
            'Một số kế hoạch học tập đã được tạo/cập nhật, nhưng có lỗi xảy ra với những môn học khác.',
          successfulRegistrations: successfulStudyPlans,
          failedRegistrations: conflictMessages,
        });
      } else {
        throw new ConflictException({
          message: 'Không thể tạo bất kỳ kế hoạch học tập nào.',
          errors: conflictMessages,
        });
      }
    }

    return this.studyPlanRepository.find({
      where: { id: In(createdOrUpdatedStudyPlanIds) },
      relations: ['student', 'semester', 'course'],
    });
  }

  /**
   * Tìm (các) kế hoạch học tập của một sinh viên.
   *
   * - Quản trị viên, Quản lý đào tạo, Giảng viên có thể xem kế hoạch học tập của bất kỳ sinh viên nào qua `studentId`.
   * - Sinh viên chỉ có thể xem kế hoạch học tập của chính mình (khi `studentId` truyền vào khớp với `student.id` của họ).
   *
   * @param targetStudentId ID của sinh viên mà kế hoạch học tập cần được tìm.
   * @param currentUser Thông tin người dùng đang thực hiện yêu cầu (để kiểm tra quyền).
   * @param currentStudent Thông tin sinh viên của người dùng đang thực hiện yêu cầu (nếu người dùng là sinh viên).
   *                       Có thể là `null` hoặc `undefined` nếu `currentUser` không phải là sinh viên.
   * @returns Một mảng các `StudyPlanEntity` của sinh viên, hoặc một mảng rỗng nếu không tìm thấy.
   * @throws `ForbiddenException` nếu người dùng không có quyền xem.
   */
  async findStudyPlansByStudentId(
    targetStudentId: number,
    currentUser: UserEntity,
    currentStudent?: StudentEntity | null,
  ): Promise<StudyPlanEntity[]> {
    const isAdminOrManagerOrLecturer = [
      EUserRole.ADMINISTRATOR,
      EUserRole.ACADEMIC_MANAGER,
      EUserRole.LECTURER,
    ].includes(currentUser.role);

    if (!isAdminOrManagerOrLecturer) {
      if (!currentStudent || targetStudentId !== currentStudent.id) {
        throw new ForbiddenException(
          'Bạn không có quyền xem kế hoạch học tập của sinh viên này.',
        );
      }
    }

    const studyPlans = await this.studyPlanRepository.find({
      where: {
        studentId: targetStudentId,
      },
      relations: {
        course: true,
        semester: true,
      },
      order: {
        semester: {
          id: 'ASC',
        },
      },
    });

    return studyPlans;
  }

  /**
   * Lấy danh sách kế hoạch học tập .
   * @param paginationDto - Thông tin phân trang.
   * @param filterDto - Thông tin lọc.
   * @param currentUser - Thông tin người dùng hiện tại.
   * @returns Promise<{ data: StudyPlanEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll({
    currentUser,
    filterDto,
    paginationDto,
    order,
  }: {
    currentUser: UserEntity;
    filterDto: FilterStudyPlanDto;
    paginationDto?: PaginationDto;
    order?: FindOptionsOrder<StudentEntity>;
  }): Promise<{ data: StudyPlanEntity[]; meta: MetaDataInterface }> {
    paginationDto = paginationDto ?? DEFAULT_PAGINATION;
    const { page = 1, limit = 10 } = paginationDto;
    const { semesterId, courseId, status } = filterDto;
    const { studentId } = filterDto;

    const where: FindOptionsWhere<StudyPlanEntity> = {};

    if (currentUser.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.getOne({
        userId: currentUser.id,
      });
      if (!studentProfile)
        return { data: [], meta: generatePaginationMeta(0, page, limit) };
      where.studentId = studentProfile.id;
    } else if (
      [EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
        currentUser.role,
      )
    ) {
      if (studentId) where.studentId = studentId;
      // if (facultyId) where.course = { courseFaculties: { facultyId } };
    } else {
      return { data: [], meta: generatePaginationMeta(0, page, limit) };
    }

    if (semesterId !== undefined) {
      where.semester = { id: semesterId };
    }
    if (courseId !== undefined) where.courseId = courseId;
    if (status !== undefined)
      where.status = status as unknown as EStudyPlanStatus;

    const [data, total] = await this.studyPlanRepository.findAndCount({
      where,
      relations: {
        course: true,
        student: {
          user: true,
        },
        semester: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: order
        ? order
        : {
            studentId: 'ASC',
            semesterId: 'ASC',
            course: { name: 'ASC' },
            updatedAt: 'ASC',
          },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findCourseRegistrations(
    semesterId: number,
    courseIds: number[],
    isExtraClassGroup?: boolean,
    isRegisterFromDate?: Date,
    isRegisterToDate?: Date,
  ): Promise<CourseSchedulingInfoDTO[]> {
    const whereClause: FindOptionsWhere<StudyPlanEntity> = {
      courseId: In(courseIds),
      semesterId,
    };

    if (isExtraClassGroup) {
      if (isRegisterFromDate && isRegisterToDate) {
        whereClause.updatedAt = Between(isRegisterFromDate, isRegisterToDate);
      } else {
        throw new BadRequestException(
          'Cần cung cấp ngày đăng ký và ngày kết thúc đăng ký nhóm lớp bổ sung',
        );
      }
    }

    const studyPlans = await this.studyPlanRepository.find({
      where: whereClause,
      relations: ['course'],
    });

    const courseMap = new Map<
      number,
      { course: CourseEntity; registeredStudents: number }
    >();

    for (const plan of studyPlans) {
      const entry = courseMap.get(plan.courseId);
      if (entry) {
        entry.registeredStudents += 1;
      } else {
        courseMap.set(plan.courseId, {
          course: plan.course,
          registeredStudents: 1,
        });
      }
    }

    const result: CourseSchedulingInfoDTO[] = [];

    for (const [
      courseId,
      { course, registeredStudents },
    ] of courseMap.entries()) {
      const totalSemesterSessions = CourseHelper.getTotalSessionPerSemester(
        course.credit,
      );

      const lecturerIds =
        await this.lecturerCourseService.findLecturersByCourseId(courseId);

      result.push({
        courseId: course.id,
        credits: course.credit,
        totalSemesterSessions,
        registeredStudents,
        potentialLecturerIds: lecturerIds,
      });
    }

    return result;
  }

  /**
   * Cập nhật trạng thái của một mục trong kế hoạch học tập (chỉ dùng bởi Admin/Manager).
   * @param id - ID của StudyPlan.
   * @param updateStudyPlanDto - Dữ liệu cập nhật (chỉ chứa status).
   * @param currentUser - Thông tin người dùng thực hiện (phải là Admin/Manager).
   * @returns Promise<StudyPlanEntity> - Mục kế hoạch sau khi cập nhật.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws ForbiddenException nếu không phải Admin/Manager.
   */
  async update(
    id: number,
    updateStudyPlanDto: UpdateStudyPlanDto,
    currentUser: UserEntity,
  ): Promise<StudyPlanEntity> {
    if (
      ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(
        currentUser.role,
      )
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật trạng thái kế hoạch học tập này.',
      );
    }

    const studyPlanToUpdate = await this.findOne(id);

    if (updateStudyPlanDto.status !== undefined) {
      studyPlanToUpdate.status = updateStudyPlanDto.status;
    } else {
      return studyPlanToUpdate;
    }

    try {
      await this.studyPlanRepository.save(studyPlanToUpdate);
      return this.findOne(id, ['student', 'semester', 'course']);
    } catch (error) {
      console.error('Lỗi khi cập nhật kế hoạch học tập:', error);
      throw new BadRequestException('Không thể cập nhật kế hoạch học tập.');
    }
  }

  /**
   * Hủy một mục trong kế hoạch học tập (chuyển status thành CANCELLED).
   * @param id - ID của StudyPlan cần hủy.
   * @param currentUser - Người dùng thực hiện.
   * @returns Promise<StudyPlanEntity> - Mục kế hoạch sau khi hủy.
   * @throws NotFoundException nếu không tìm thấy.
   * @throws ForbiddenException nếu không có quyền.
   * @throws BadRequestException nếu kế hoạch đã bị hủy trước đó.
   */
  async cancel(id: number, currentUser: UserEntity): Promise<StudyPlanEntity> {
    const studyPlan = await this.findOneWithAuth(id, currentUser, ['student']);

    if (studyPlan.status === EStudyPlanStatus.CANCELLED) {
      throw new BadRequestException(
        `Kế hoạch học tập ID ${id} đã bị hủy trước đó.`,
      );
    }

    studyPlan.status = EStudyPlanStatus.CANCELLED;

    try {
      await this.studyPlanRepository.save(studyPlan);
      return this.findOne(id, ['student', 'semester', 'course']);
    } catch (error) {
      console.error('Lỗi khi hủy kế hoạch học tập:', error);
      throw new InternalServerErrorException('Không thể hủy kế hoạch học tập.');
    }
  }

  /**
   * Hủy nhiều mục trong kế hoạch học tập (chuyển status thành CANCELLED).
   * @param ids - Mảng ID của các StudyPlan cần hủy.
   * @param currentUser - Người dùng thực hiện.
   * @returns Promise<StudyPlanEntity[]> - Danh sách các mục kế hoạch sau khi hủy.
   * @throws BadRequestException nếu mảng IDs rỗng hoặc có kế hoạch đã hủy.
   * @throws ForbiddenException nếu không có quyền trên bất kỳ kế hoạch nào.
   * @throws NotFoundException nếu không tìm thấy bất kỳ kế hoạch nào.
   * @throws InternalServerErrorException nếu có lỗi hệ thống.
   */
  async cancelMultiple(
    ids: number[],
    currentUser: UserEntity,
  ): Promise<StudyPlanEntity[]> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp danh sách ID để hủy.');
    }

    const studyPlans = await this.studyPlanRepository.find({
      where: { id: In(ids) },
      relations: ['student'],
    });

    if (studyPlans.length !== ids.length) {
      const foundIds = new Set(studyPlans.map((sp) => sp.id));
      const notFoundIds = ids.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Các kế hoạch học tập với ID sau không tìm thấy: ${notFoundIds.join(', ')}.`,
      );
    }

    // 3. Kiểm tra quyền và trạng thái cho từng kế hoạch
    for (const studyPlan of studyPlans) {
      if (
        studyPlan.student.id !== currentUser.id &&
        [EUserRole.ADMINISTRATOR, EUserRole.LECTURER].includes(currentUser.role)
      ) {
        throw new ForbiddenException(
          `Bạn không có quyền hủy kế hoạch học tập ID ${studyPlan.id}.`,
        );
      }
      if (studyPlan.status === EStudyPlanStatus.CANCELLED) {
        // throw new BadRequestException(
        //   `Kế hoạch học tập ID ${studyPlan.id} đã bị hủy trước đó.`,
        // );
        continue;
      }
    }

    try {
      await this.studyPlanRepository.update(
        { id: In(ids) },
        { status: EStudyPlanStatus.CANCELLED },
      );

      return await this.studyPlanRepository.find({
        where: { id: In(ids) },
        relations: ['student', 'semester', 'course'],
      });
    } catch (error) {
      console.error('Lỗi khi hủy nhiều kế hoạch học tập:', error);
      throw new InternalServerErrorException(
        'Không thể hủy các kế hoạch học tập đã chọn.',
      );
    }
  }

  /**
   * Xóa một mục khỏi kế hoạch học tập (chỉ khi status là PLANNED hoặc CANCELLED).
   * @param id - ID của StudyPlan cần xóa.
   * @param currentUser - Thông tin người dùng thực hiện.
   * @returns Promise<void>
   * @throws NotFoundException nếu không tìm thấy.
   * @throws ForbiddenException nếu không có quyền xóa.
   */
  async remove(id: number, currentUser: UserEntity): Promise<void> {
    await this.findOneWithAuth(id, currentUser);
    await this.studyPlanRepository.delete(id);
  }
}
