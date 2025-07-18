import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { StudentEntity } from './entities/student.entity';
import {
  EAccountStatus,
  EStudentStatus,
  EUserRole,
} from 'src/utils/enums/user.enum';
import { CreateStudentDto } from './dtos/createStudent.dto';
import _ from 'lodash';
import { ClassEntity } from '../class/entities/class.entity';
import { FilterStudentDto } from './dtos/filterStudent.dto';
import { UpdateStudentDto } from './dtos/updateStudent.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { Helpers } from 'src/utils/helpers';
import { UserService } from '../user/user.service';
import { StudentHelper } from 'src/utils/helpers/student.helper';
import { StudentChatbotDataDto } from './dtos/studentChatbotData.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    // private readonly queueProducer: QueueProducer,
  ) {}

  // async testQueue(studentDTO: CreateStudentDto): Promise<void> {
  //   console.log('testQueue@@@@studentDTO: ', studentDTO);
  //   await this.queueProducer.produce(process.env.QUEUE_STUDENT_CREATION_URL, {
  //     type: 'student',
  //     data: studentDTO,
  //   });
  // }

  /**
   * Tạo mới một sinh viên bao gồm cả việc tạo tài khoản người dùng liên kết.
   * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
   * @param studentDTO - Dữ liệu để tạo sinh viên (bao gồm thông tin user).
   * @returns Promise<Partial<UserEntity>> - Thông tin User mới tạo (không bao gồm password).
   * @throws BadRequestException - Nếu dữ liệu đầu vào không hợp lệ (email tồn tại, lớp không đủ thông tin).
   * @throws NotFoundException - Nếu không tìm thấy Lớp học với classId cung cấp.
   * @throws ConflictException - Nếu email (cá nhân, trường) hoặc mã sinh viên được tạo ra bị trùng.
   * @throws InternalServerErrorException - Nếu có lỗi xảy ra trong quá trình xử lý transaction hoặc tạo mã.
   */
  async createStudent(
    studentDTO: CreateStudentDto,
  ): Promise<Partial<StudentEntity>> {
    const {
      studentCode,
      personalEmail,
      firstName,
      lastName,
      classId,
      academicYear,
      enrollmentDate,
      expectedGraduationDate,
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
    } = studentDTO;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    console.log('Transaction CREATED');

    try {
      // const existingPersonal =
      //   await this.userService.getUserByPersonalEmail(personalEmail);
      // if (existingPersonal.length > 0) {
      //   throw new ConflictException(
      //     `Email cá nhân '${personalEmail}' đã được sử dụng.`,
      //   );
      // }

      const classEntity = await queryRunner.manager.findOne(ClassEntity, {
        where: { id: classId },
        relations: { major: { department: { faculty: true } } },
      });
      if (!classEntity) {
        throw new NotFoundException(`Không tìm thấy lớp với ID ${classId}`);
      }
      if (
        !classEntity.major?.id ||
        !classEntity.major?.department?.faculty?.facultyCode
      ) {
        throw new BadRequestException(
          `Thông tin Khoa/Bộ môn/Chuyên ngành của lớp '${classEntity.classCode}' (ID: ${classId}) không đầy đủ để tạo mã sinh viên.`,
        );
      }
      const { facultyCode } = classEntity.major.department.faculty;
      const majorId = classEntity.major.id;

      let studentCodeGenerated: string;
      if (studentCode && studentCode.length > 0) {
        studentCodeGenerated = studentCode;
      } else {
        try {
          studentCodeGenerated = await StudentHelper.generateStudentCode(
            this.dataSource,
            facultyCode,
            academicYear,
            majorId,
          );
        } catch (error) {
          console.error('Lỗi khi tạo mã sinh viên:', error);
          if (error instanceof InternalServerErrorException) throw error;
          throw new InternalServerErrorException(
            'Không thể tạo mã sinh viên duy nhất.',
          );
        }
      }

      const uniEmail = Helpers.generateStudentEmail(studentCodeGenerated);
      const existingUniEmail =
        await this.userService.getUserByUniEmail(uniEmail);
      if (existingUniEmail) {
        throw new ConflictException(
          `Email trường cấp '${uniEmail}' được tạo tự động đã tồn tại.`,
        );
      }

      const hashedPassword = await Helpers.hashPassword({
        password: identityCardNumber,
      });

      const userToCreate: Partial<UserEntity> = {
        personalEmail,
        universityEmail: uniEmail,
        password: hashedPassword,
        firstName,
        lastName,
        role: EUserRole.STUDENT,
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

      const studentToCreate: Partial<StudentEntity> = {
        studentCode: studentCodeGenerated,
        status: EStudentStatus.STUDYING,
        userId: savedUser.id,
        majorId: majorId,
        classId: classId,
        academicYear,
        enrollmentDate: new Date(enrollmentDate),
        expectedGraduationDate: expectedGraduationDate
          ? new Date(expectedGraduationDate)
          : null,
      };
      await queryRunner.manager.save(StudentEntity, studentToCreate);

      await queryRunner.commitTransaction();

      return _.omit(studentToCreate);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Lỗi khi tạo sinh viên:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi không mong muốn khi tạo sinh viên.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lấy danh sách sinh viên có phân trang và lọc.
   * Trả về thông tin user liên kết (không bao gồm password).
   * @param paginationDto - DTO chứa thông tin phân trang.
   * @param filterDto - DTO chứa các tiêu chí lọc.
   * @returns Promise<{ data: StudentEntity[]; meta: MetaDataInterface }> - Danh sách sinh viên và metadata.
   */
  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterStudentDto,
  ): Promise<{ data: StudentEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<StudentEntity> = {};
    if (filterDto?.facultyId) {
      where.major = {
        department: {
          faculty: { id: filterDto.facultyId },
        },
      };
    }
    if (filterDto?.departmentId) {
      where.major = {
        department: { id: filterDto.departmentId },
      };
    }
    if (filterDto?.majorId) {
      where.majorId = filterDto.majorId;
    }
    if (filterDto?.classId) {
      where.classId = filterDto.classId;
    }
    if (filterDto?.status) {
      where.user = { isActive: filterDto.status };
    }

    const [students, total] = await this.studentRepository.findAndCount({
      skip,
      take: limit,
      relations: {
        user: true,
        major: {
          department: {
            faculty: true,
          },
        },
        class: true,
      },
      where,
      order: {
        studentCode: 'ASC',
      },
    });

    const sanitizedData = students.map((student) => ({
      ...student,
      user: student.user ? _.omit(student.user, ['password']) : null,
    })) as StudentEntity[];

    const meta = generatePaginationMeta(total, page, limit);

    return { data: sanitizedData, meta };
  }

  /**
   * Lấy thông tin chi tiết một sinh viên bằng ID.
   * Bao gồm thông tin user (không password), lớp, chuyên ngành, khoa, bộ môn.
   * @param id - ID của sinh viên cần tìm.
   * @returns Promise<StudentEntity> - Thông tin chi tiết sinh viên.
   * @throws NotFoundException - Nếu không tìm thấy sinh viên.
   */
  async findOneById(id: number): Promise<Partial<StudentEntity>> {
    const student = await this.studentRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        major: true,
        user: true,
        class: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
    return _.omit(student, ['user.password']);
  }

  /**
   * Cập nhật thông tin sinh viên và/hoặc thông tin người dùng liên kết.
   * Sử dụng transaction.
   * @param id - ID của sinh viên cần cập nhật.
   * @param updateDto - Dữ liệu cần cập nhật.
   * @returns Promise<StudentEntity> - Thông tin sinh viên sau khi cập nhật.
   * @throws NotFoundException - Nếu không tìm thấy sinh viên hoặc lớp mới.
   * @throws BadRequestException - Nếu thông tin lớp mới không hợp lệ.
   * @throws ConflictException - Nếu email cập nhật bị trùng.
   * @throws InternalServerErrorException - Nếu có lỗi trong quá trình cập nhật.
   */
  async update(
    id: number,
    updateDto: UpdateStudentDto,
  ): Promise<Partial<StudentEntity>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id },
        relations: ['user'],
      });

      if (!student) {
        throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
      }
      if (!student.user) {
        throw new InternalServerErrorException(
          `Dữ liệu không nhất quán: Thiếu thông tin User cho Sinh viên ID ${id}.`,
        );
      }
      const userId = student.user.id;

      const {
        classId,
        academicYear,
        gpa,
        expectedGraduationDate,
        dateOfBirth,
        status,
        ...otherUserData
      } = updateDto;

      const userUpdatePayload: Partial<UserEntity> = _.omit(
        _.omitBy(
          {
            ...otherUserData,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          },
          _.isNil,
        ),
        ['studentCode'],
      );

      if (Object.keys(userUpdatePayload).length > 0) {
        // if (
        //   userUpdatePayload.personalEmail &&
        //   userUpdatePayload.personalEmail !== student.user.personalEmail
        // ) {
        //   const existingPersonal =
        //     await this.userService.getUserByPersonalEmail(
        //       userUpdatePayload.personalEmail,
        //     );
        //   if (
        //     existingPersonal.length > 0 &&
        //     existingPersonal.some((u) => u.id !== userId)
        //   ) {
        //     throw new ConflictException(
        //       `Email cá nhân '${userUpdatePayload.personalEmail}' đã được sử dụng bởi người dùng khác.`,
        //     );
        //   }
        // }
        if (userUpdatePayload.password) {
          userUpdatePayload.password = await Helpers.hashPassword({
            password: userUpdatePayload.password,
          });
        }
        await queryRunner.manager.update(UserEntity, userId, userUpdatePayload);
      }

      const studentUpdatePayload: Partial<StudentEntity> = {};
      if (academicYear !== undefined)
        studentUpdatePayload.academicYear = academicYear;
      if (gpa !== undefined) studentUpdatePayload.gpa = gpa;
      if (expectedGraduationDate !== undefined)
        studentUpdatePayload.expectedGraduationDate = expectedGraduationDate
          ? new Date(expectedGraduationDate)
          : null;

      if (classId !== undefined && classId !== student.classId) {
        const newClass = await queryRunner.manager.findOne(ClassEntity, {
          where: { id: classId },
        });
        if (!newClass) {
          throw new NotFoundException(
            `Không tìm thấy lớp mới với ID ${classId}`,
          );
        }
        if (!newClass.major?.id) {
          throw new BadRequestException(
            `Lớp mới (ID: ${classId}) không có thông tin Chuyên ngành hợp lệ.`,
          );
        }
        studentUpdatePayload.classId = classId;
        studentUpdatePayload.majorId = newClass.major.id;
      }
      if (status !== undefined) {
        studentUpdatePayload.status = status as EStudentStatus;
      }
      console.log('studentUpdatePayload.status:', studentUpdatePayload.status);

      const cleanStudentUpdatePayload = _.omitBy(studentUpdatePayload, _.isNil);
      if (Object.keys(cleanStudentUpdatePayload).length > 0) {
        await queryRunner.manager.update(
          StudentEntity,
          id,
          cleanStudentUpdatePayload,
        );
      }

      await queryRunner.commitTransaction();

      return this.findOneById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Lỗi khi cập nhật sinh viên:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi không mong muốn khi cập nhật sinh viên.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Xóa sinh viên (bao gồm cả tài khoản người dùng liên kết).
   * Sử dụng transaction và onDelete: 'CASCADE' trên quan hệ User.
   * @param id - ID của sinh viên cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException - Nếu không tìm thấy sinh viên.
   * @throws InternalServerErrorException - Nếu có lỗi trong quá trình xóa.
   */
  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id },
        select: ['id', 'userId'],
      });

      if (!student) {
        throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
      }

      await queryRunner.manager.delete(UserEntity, student.userId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Lỗi khi xóa sinh viên:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi không mong muốn khi xóa sinh viên.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOneByUserId(userId: number): Promise<StudentEntity> {
    return this.studentRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Lấy một sinh viên dựa trên điều kiện tùy chỉnh.
   * @param condition - Điều kiện tìm kiếm.
   * @param relations - Các quan hệ cần load.
   * @returns Promise<StudentEntity> - Thông tin sinh viên.
   * @throws NotFoundException - Nếu không tìm thấy sinh viên.
   */
  async getOne(
    condition:
      | FindOptionsWhere<StudentEntity>
      | FindOptionsWhere<StudentEntity>[],
    relations?: FindOptionsRelations<StudentEntity>,
  ): Promise<StudentEntity> {
    const student = await this.studentRepository.findOne({
      where: condition,
      relations: relations,
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy sinh viên với điều kiện tìm kiếm.`,
      );
    }
    // Omit password nếu user được load
    if (student?.user) {
      student.user = _.omit(student.user, ['password']) as UserEntity;
    }
    return student;
  }

  /**
   * Lấy một sinh viên dựa trên điều kiện tùy chỉnh.
   * @param condition - Điều kiện tìm kiếm.
   * @param relations - Các quan hệ cần load.
   * @returns Promise<StudentEntity> - Thông tin sinh viên.
   * @throws NotFoundException - Nếu không tìm thấy sinh viên.
   */
  async getStudentByStudentCode(
    studentCode: string,
    omitPassword: boolean = true,
  ): Promise<StudentEntity> {
    const student = await this.studentRepository.findOne({
      where: { studentCode },
      relations: ['user', 'major', 'class'],
    });

    // Omit password
    if (student?.user && omitPassword) {
      student.user = _.omit(student.user, ['password']) as UserEntity;
    }
    return student;
  }

  /**
   * Lấy danh sách sinh viên thuộc một lớp học cụ thể.
   * @param classId - ID của lớp học.
   * @returns Promise<StudentEntity[]> - Danh sách sinh viên.
   */
  async getStudentsByClass(classId: number): Promise<StudentEntity[]> {
    const students = await this.studentRepository.find({
      where: { classId },
      relations: ['user'],
    });

    // Omit password
    return students.map((s) => ({
      ...s,
      user: s.user ? (_.omit(s.user, ['password']) as UserEntity) : null,
    }));
  }

  /**
   * Lấy toàn bộ dữ liệu sinh viên cho chatbot.
   * Bao gồm: thông tin cơ bản, lịch học, lịch thi, học phí, thông báo, điểm số.
   * @param studentId - ID của sinh viên.
   * @returns Promise<StudentChatbotDataDto> - Dữ liệu tổng hợp cho chatbot.
   */
  async getChatbotData(studentId: number): Promise<StudentChatbotDataDto> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: [
        'user',
        'class',
        'class.major',
        'class.major.department',
        'class.major.department.faculty',
        'major',
      ],
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy sinh viên với ID ${studentId}`,
      );
    }

    const currentSemester = await this.dataSource
      .getRepository('SemesterEntity')
      .createQueryBuilder('semester')
      .where('semester.startDate <= :now', { now: new Date() })
      .andWhere('semester.endDate >= :now', { now: new Date() })
      .getOne();

    if (!currentSemester) {
      throw new NotFoundException('Không tìm thấy học kỳ hiện tại');
    }

    const nextSemester = await this.dataSource
      .getRepository('SemesterEntity')
      .createQueryBuilder('semester')
      .where('semester.startDate > :currentEndDate', {
        currentEndDate: currentSemester.endDate,
      })
      .orderBy('semester.startDate', 'ASC')
      .getOne();

    const weeklySchedule = await this.dataSource
      .getRepository('ClassWeeklyScheduleEntity')
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('classGroup.lecturer', 'lecturer')
      .leftJoinAndSelect('lecturer.user', 'lecturerUser')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.timeSlot', 'timeSlot')
      .leftJoin(
        'EnrollmentCourseEntity',
        'enrollment',
        'enrollment.classGroupId = classGroup.id',
      )
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('classGroup.semesterId = :semesterId', {
        semesterId: 44,
      })
      .getMany();

    const upcomingExams = await this.dataSource
      .getRepository('ExamScheduleEntity')
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('exam.room', 'room')
      .leftJoin(
        'EnrollmentCourseEntity',
        'enrollment',
        'enrollment.classGroupId = classGroup.id',
      )
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('exam.examDate >= :now', { now: new Date() })
      .orderBy('exam.examDate', 'ASC')
      .limit(10)
      .getMany();

    const tuitionInfo = await this.dataSource
      .getRepository('TuitionEntity')
      .createQueryBuilder('tuition')
      .leftJoinAndSelect('tuition.details', 'details')
      .leftJoinAndSelect('details.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .where('tuition.studentId = :studentId', { studentId })
      .andWhere('tuition.semesterId = :semesterId', {
        semesterId: currentSemester.id,
      })
      .getMany();

    const recentNotifications = await this.dataSource
      .getRepository('NotificationEntity')
      .createQueryBuilder('notification')
      .leftJoinAndSelect(
        'notification.recipients',
        'recipient',
        'recipient.recipientUserId = :userId',
        {
          userId: student.userId,
        },
      )
      .where('notification.status = :status', { status: 'SENT' })
      .orderBy('notification.createdAt', 'DESC')
      .limit(20)
      .getMany();

    const currentGrades = await this.dataSource
      .getRepository('GradeDetailEntity')
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.enrollment', 'enrollment')
      .leftJoinAndSelect('enrollment.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('classGroup.semesterId = :semesterId', {
        semesterId: currentSemester.id,
      })
      .getMany();

    const scheduleAdjustments = await this.dataSource
      .getRepository('ClassAdjustmentScheduleEntity')
      .createQueryBuilder('adjustment')
      .leftJoinAndSelect('adjustment.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoin(
        'EnrollmentCourseEntity',
        'enrollment',
        'enrollment.classGroupId = classGroup.id',
      )
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('adjustment.adjustmentDate >= :now', { now: new Date() })
      .orderBy('adjustment.adjustmentDate', 'ASC')
      .getMany();

    const enrollments = await this.dataSource
      .getRepository('EnrollmentCourseEntity')
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .where('enrollment.studentId = :studentId', { studentId })
      .getMany();

    const currentSemesterEnrollments = enrollments.filter(
      (e) => e.classGroup.semesterId === currentSemester.id,
    );

    const totalCreditsRegistered = enrollments.reduce(
      (sum, e) => sum + (e.classGroup.course?.credit || 0),
      0,
    );
    const currentSemesterCredits = currentSemesterEnrollments.reduce(
      (sum, e) => sum + (e.classGroup.course?.credit || 0),
      0,
    );

    let nextSemesterData = null;
    if (nextSemester) {
      const registrationSchedule = await this.dataSource
        .getRepository('FacultyRegistrationScheduleEntity')
        .createQueryBuilder('schedule')
        .where('schedule.semesterId = :semesterId', {
          semesterId: nextSemester.id,
        })
        .andWhere('schedule.facultyId = :facultyId', {
          facultyId: student.class.major.department.faculty.id,
        })
        .getMany();

      const availableCourses = await this.dataSource
        .getRepository('CurriculumCourseEntity')
        .createQueryBuilder('curriculumCourse')
        .leftJoinAndSelect('curriculumCourse.course', 'course')
        .leftJoin(
          'CurriculumEntity',
          'curriculum',
          'curriculum.id = curriculumCourse.curriculumId',
        )
        .where('curriculum.majorId = :majorId', { majorId: student.majorId })
        .getMany();

      const estimatedTuition = {
        pricePerCredit: 700000,
        estimatedMinCredits: 15,
        estimatedMaxCredits: 25,
        estimatedMinAmount: 15 * 700000,
        estimatedMaxAmount: 25 * 700000,
      };

      nextSemesterData = {
        semesterInfo: nextSemester
          ? {
              id: nextSemester.id,
              semesterCode: nextSemester.semesterCode,
              semesterName: nextSemester.semesterName,
              startDate: nextSemester.startDate,
              endDate: nextSemester.endDate,
              isCurrentSemester: false,
            }
          : null,
        registrationSchedule: registrationSchedule.map((schedule) => ({
          startDate: schedule.registrationStartDate,
          endDate: schedule.registrationEndDate,
          description: schedule.description || 'Đăng ký môn học',
          isActive:
            new Date() >= schedule.registrationStartDate &&
            new Date() <= schedule.registrationEndDate,
        })),
        availableCourses: availableCourses.map((curriculumCourse) => ({
          courseCode: curriculumCourse.course.courseCode,
          name: curriculumCourse.course.name,
          credit: curriculumCourse.course.credit,
          prerequisiteCourses: [],
          maxStudents: 50,
          registeredStudents: 0,
          isAvailable: true,
        })),
        estimatedTuition,
      };
    } else {
      nextSemesterData = {
        semesterInfo: null,
        registrationSchedule: [],
        availableCourses: [],
        estimatedTuition: {
          pricePerCredit: 700000,
          estimatedMinCredits: 0,
          estimatedMaxCredits: 0,
          estimatedMinAmount: 0,
          estimatedMaxAmount: 0,
        },
      };
    }

    const result: StudentChatbotDataDto = {
      basicInfo: {
        id: student.id,
        studentCode: student.studentCode,
        fullName: `${student.user.firstName} ${student.user.lastName}`,
        personalEmail: student.user.personalEmail,
        universityEmail: student.user.universityEmail,
        phoneNumber: student.user.phoneNumber,
        academicYear: student.academicYear,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        expectedGraduationDate: student.expectedGraduationDate,
      },
      classInfo: {
        id: student.class.id,
        classCode: student.class.classCode,
        className: student.class.classCode,
        major: {
          id: student.class.major.id,
          majorCode: student.class.major.majorCode,
          majorName: student.class.major.name,
          department: {
            id: student.class.major.department.id,
            departmentCode: student.class.major.department.departmentCode,
            departmentName: student.class.major.department.name,
            faculty: {
              id: student.class.major.department.faculty.id,
              facultyCode: student.class.major.department.faculty.facultyCode,
              facultyName: student.class.major.department.faculty.name,
            },
          },
        },
      },
      currentSemester: {
        id: currentSemester.id,
        semesterCode: currentSemester.semesterCode,
        semesterName: currentSemester.semesterName,
        startDate: currentSemester.startDate,
        endDate: currentSemester.endDate,
        isCurrentSemester: true,
      },
      weeklySchedule: weeklySchedule.map((schedule) => ({
        id: schedule.id,
        course: {
          courseCode: schedule.classGroup.course.courseCode,
          name: schedule.classGroup.course.name,
          credit: schedule.classGroup.course.credit,
        },
        room: {
          roomNumber: schedule.room.roomNumber,
        },
        timeSlot: {
          startTime: schedule.timeSlot.startTime,
          endTime: schedule.timeSlot.endTime,
          dayOfWeek: schedule.timeSlot.dayOfWeek,
        },
        weekNumbers: schedule.weekNumbers,
      })),
      upcomingExams: upcomingExams.map((exam) => ({
        id: exam.id,
        course: {
          courseCode: exam.classGroup.course.courseCode,
          name: exam.classGroup.course.name,
          credit: exam.classGroup.course.credit,
        },
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        room: {
          roomNumber: exam.room.roomNumber,
        },
        notes: exam.notes,
      })),
      tuitionInfo: tuitionInfo.map((tuition) => ({
        id: tuition.id,
        description: tuition.description,
        totalAmountDue: tuition.totalAmountDue,
        amountPaid: tuition.amountPaid,
        balance: tuition.balance,
        status: tuition.status,
        dueDate: tuition.dueDate,
        details: tuition.details.map((detail) => ({
          courseCode: detail.enrollment.classGroup.course.courseCode,
          courseName: detail.enrollment.classGroup.course.courseName,
          credit: detail.numberOfCredits,
          amount: detail.amount,
          pricePerCredit: detail.pricePerCredit,
        })),
      })),
      recentNotifications: recentNotifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        content: notification.content,
        notificationType: notification.notificationType,
        priority: notification.priority,
        createdAt: notification.createdAt,
        isRead: notification.recipients.length > 0,
      })),
      currentGrades: currentGrades.map((grade) => ({
        course: {
          courseCode: grade.enrollment.classGroup.course.courseCode,
          name: grade.enrollment.classGroup.course.name,
          credit: grade.enrollment.classGroup.course.credit,
        },
        processScore: grade.processScore,
        finalScore: grade.finalScore,
        totalScore: grade.totalScore,
        letterGrade: grade.letterGrade,
        isPassed: grade.isPassed,
      })),
      academicSummary: {
        totalCreditsRegistered,
        totalCreditsPassed: currentGrades
          .filter((g) => g.isPassed)
          .reduce(
            (sum, g) => sum + (g.enrollment.classGroup.course?.credit || 0),
            0,
          ),
        currentGPA: student.gpa || 0,
        cumulativeGPA: student.gpa || 0,
        currentSemesterCredits,
      },
      scheduleAdjustments: scheduleAdjustments.map((adjustment) => ({
        originalDate: adjustment.originalDate,
        newDate: adjustment.newDate,
        course: {
          courseCode: adjustment.classGroup.course.courseCode,
          name: adjustment.classGroup.course.name,
        },
        reason: adjustment.reason,
      })),
      nextSemester: nextSemesterData,
    };

    return result;
  }
}
