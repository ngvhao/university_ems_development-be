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
import { Repository, FindOptionsWhere, Not, In } from 'typeorm';
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

@Injectable()
export class StudyPlanService {
  constructor(
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
   * @param createStudyPlanDto - Dữ liệu tạo kế hoạch.
   * @param currentUser - Thông tin người dùng thực hiện.
   * @returns Promise<StudyPlanEntity> - Mục kế hoạch vừa tạo.
   * @throws ForbiddenException nếu user không có quyền hoặc không phải là SV tương ứng.
   * @throws NotFoundException nếu Student, Semester hoặc Course không tồn tại.
   * @throws ConflictException nếu mục kế hoạch đã tồn tại.
   */
  async create(
    createStudyPlanDto: CreateStudyPlanDto,
    currentUser: UserEntity,
  ): Promise<StudyPlanEntity> {
    const { semesterId, courseId } = createStudyPlanDto;
    let { studentId } = createStudyPlanDto;

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
      await this.studentService.getOne({
        id: studentId,
      });
    }

    await Promise.all([
      this.semesterService.findOne(semesterId),
      this.courseService.findOne(courseId),
    ]);

    await this.checkConflict(studentId, semesterId, courseId);

    try {
      const studyPlan = this.studyPlanRepository.create({
        studentId,
        semesterId,
        courseId,
        status: EStudyPlanStatus.PLANNED,
      });
      const saved = await this.studyPlanRepository.save(studyPlan);
      return this.findOne(saved.id, ['student', 'semester', 'course']);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Sinh viên ID ${studentId} có thể đã có kế hoạch học Môn học ID ${courseId} trong Học kỳ ID ${semesterId}.`,
        );
      }
      console.error('Lỗi khi tạo kế hoạch học tập:', error);
      throw new BadRequestException('Không thể tạo kế hoạch học tập.');
    }
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
   * Lấy danh sách kế hoạch học tập (có phân trang và lọc).
   * @param paginationDto - Thông tin phân trang.
   * @param filterDto - Thông tin lọc.
   * @param currentUser - Thông tin người dùng hiện tại.
   * @returns Promise<{ data: StudyPlanEntity[]; meta: MetaDataInterface }> - Danh sách và metadata.
   */
  async findAll(
    currentUser: UserEntity,
    filterDto: FilterStudyPlanDto,
    paginationDto: PaginationDto,
  ): Promise<{ data: StudyPlanEntity[]; meta: MetaDataInterface }> {
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
    } else {
      return { data: [], meta: generatePaginationMeta(0, page, limit) };
    }

    if (semesterId !== undefined) {
      where.semester = { id: semesterId };
    }
    if (courseId !== undefined) where.courseId = courseId;
    if (status !== undefined) where.status = status;

    const [data, total] = await this.studyPlanRepository.findAndCount({
      where,
      relations: ['course'],
      skip: (page - 1) * limit,
      take: limit,
      order: { studentId: 'ASC', semesterId: 'ASC', course: { name: 'ASC' } },
    });

    const meta = generatePaginationMeta(total, page, limit);
    return { data, meta };
  }

  async findCourseRegistrations(
    semesterId: number,
    courseIds: number[],
  ): Promise<CourseSchedulingInfoDTO[]> {
    const studyPlans = await this.studyPlanRepository.find({
      where: {
        courseId: In(courseIds),
        semesterId,
      },
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
    const studyPlan = await this.findOneWithAuth(id, currentUser, ['student']); // Đã check quyền

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
