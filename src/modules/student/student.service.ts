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
import { EFacultyCode } from 'src/utils/enums/faculty.enum';
import { QueueProducer } from 'src/common/queue/queue.producer';

@Injectable()
export class StudentService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly queueProducer: QueueProducer,
  ) {}

  async testQueue(studentDTO: CreateStudentDto): Promise<void> {
    console.log('Queue sent');
    await this.queueProducer.produce(process.env.QUEUE_STUDENT_CREATION_URL, {
      type: 'student',
      data: studentDTO,
    });
  }

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

      let studentCode: string;
      try {
        studentCode = await this.generateStudentCode(
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

      const uniEmail = Helpers.generateStudentEmail(studentCode);
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
        studentCode: studentCode,
        status: EStudentStatus.ENROLLED,
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
   * @param filterDto - DTO chứa các tiêu chí lọc và phân trang.
   * @returns Promise<{ data: StudentEntity[]; meta: MetaDataInterface }> - Danh sách sinh viên và metadata.
   */
  async findAll(
    filterDto: FilterStudentDto,
  ): Promise<{ data: StudentEntity[]; meta: MetaDataInterface }> {
    const {
      page = 1,
      limit = 10,
      search,
      classId,
      majorId,
      academicYear,
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    queryBuilder
      .innerJoin('student.user', 'user')
      .innerJoin('student.class', 'class')
      .innerJoin('student.major', 'major')
      .select([
        'student.id',
        'student.studentCode',
        'student.academicYear',
        'student.gpa',
        'student.enrollmentDate',
        'student.expectedGraduationDate',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.userCode',
        'user.universityEmail',
        'user.personalEmail',
        'user.avatarUrl',
        'user.status',
        'user.phoneNumber',
        'class.id',
        'class.name',
        'major.id',
        'major.name',
      ]);

    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.userCode) LIKE :search OR LOWER(user.universityEmail) LIKE :search OR LOWER(user.personalEmail) LIKE :search OR LOWER(student.studentCode) LIKE :search)',
        { search: searchTerm },
      );
    }
    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }
    if (majorId) {
      queryBuilder.andWhere('student.majorId = :majorId', { majorId });
    }
    if (academicYear) {
      queryBuilder.andWhere('student.academicYear = :academicYear', {
        academicYear,
      });
    }

    queryBuilder
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  /**
   * Lấy thông tin chi tiết một sinh viên bằng ID.
   * Bao gồm thông tin user (không password), lớp, chuyên ngành, khoa, bộ môn.
   * @param id - ID của sinh viên cần tìm.
   * @returns Promise<StudentEntity> - Thông tin chi tiết sinh viên.
   * @throws NotFoundException - Nếu không tìm thấy sinh viên.
   */
  async findOneById(id: number): Promise<StudentEntity> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .innerJoin('student.class', 'class')
      .innerJoin('student.major', 'major')
      .leftJoin('major.department', 'department')
      .leftJoin('department.faculty', 'faculty')
      .select([
        'student.id',
        'student.studentCode',
        'student.academicYear',
        'student.gpa',
        'student.enrollmentDate',
        'student.expectedGraduationDate',
        'student.userId',
        'student.classId',
        'student.majorId',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.userCode',
        'user.universityEmail',
        'user.personalEmail',
        'user.avatarUrl',
        'user.status',
        'user.phoneNumber',
        'user.identityCardNumber',
        'user.dateOfBirth',
        'user.gender',
        'user.hometown',
        'user.permanentAddress',
        'user.temporaryAddress',
        'user.nationality',
        'user.ethnicity',
        'class.id',
        'class.name',
        'major.id',
        'major.name',
        'department.id',
        'department.name',
        'faculty.id',
        'faculty.name',
        'faculty.facultyCode',
      ])
      .where('student.id = :id', { id })
      .getOne();

    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
    return student;
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
  ): Promise<StudentEntity> {
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
        personalEmail,
        password,
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
        ...otherUserData
      } = updateDto;

      const userUpdatePayload: Partial<UserEntity> = _.omitBy(
        {
          personalEmail,
          password,
          firstName,
          lastName,
          avatarUrl,
          status,
          phoneNumber,
          identityCardNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          hometown,
          permanentAddress,
          temporaryAddress,
          nationality,
          ethnicity,
          ...otherUserData,
        },
        _.isNil,
      );

      if (Object.keys(userUpdatePayload).length > 0) {
        if (
          userUpdatePayload.personalEmail &&
          userUpdatePayload.personalEmail !== student.user.personalEmail
        ) {
          const existingPersonal =
            await this.userService.getUserByPersonalEmail(
              userUpdatePayload.personalEmail,
            );
          if (
            existingPersonal.length > 0 &&
            existingPersonal.some((u) => u.id !== userId)
          ) {
            throw new ConflictException(
              `Email cá nhân '${userUpdatePayload.personalEmail}' đã được sử dụng bởi người dùng khác.`,
            );
          }
        }
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
   * Tạo mã sinh viên duy nhất sử dụng giao dịch để đảm bảo tính đồng thời.
   * @param facultyCode - Mã khoa (ví dụ: CNTT).
   * @param academicYear - Khóa học (ví dụ: 2024).
   * @param majorId - ID chuyên ngành.
   * @returns Promise<string> - Mã sinh viên được tạo.
   * @throws InternalServerErrorException - Nếu không thể tạo mã duy nhất.
   */
  async generateStudentCode(
    facultyCode: string,
    academicYear: number,
    majorId: number,
  ): Promise<string> {
    const seqName = `student_code_seq_${academicYear}_${majorId}`;

    await this.ensureSequenceExists(academicYear, majorId);

    try {
      const result = await this.studentRepository.query(
        `SELECT nextval('${this.quoteIdentifier(seqName)}') as seq`,
      );

      const seqNumber = result[0]?.seq;
      if (!seqNumber) {
        throw new InternalServerErrorException(
          'Không thể lấy giá trị từ sequence.',
        );
      }

      const yearCode = academicYear.toString().slice(-2);
      const indexStr = seqNumber.toString().padStart(5, '0');

      return `${EFacultyCode[facultyCode]}${yearCode}${indexStr}`;
    } catch (error) {
      console.error(`Lỗi khi lấy giá trị sequence: ${error.message}`);
      throw new InternalServerErrorException(
        `Không thể tạo mã sinh viên cho năm học ${academicYear} và chuyên ngành ${majorId}.`,
      );
    }
  }

  /**
   * Đảm bảo sequence tồn tại cho mỗi năm và mỗi ngành.
   * @param year - Năm học (ví dụ: 2024).
   * @param majorId - ID chuyên ngành.
   * @throws InternalServerErrorException - Nếu không thể tạo sequence.
   */
  async ensureSequenceExists(year: number, majorId: number): Promise<void> {
    if (!Number.isInteger(year) || year < 2000 || year > 3000) {
      throw new InternalServerErrorException(`Năm học không hợp lệ: ${year}`);
    }
    if (!Number.isInteger(majorId) || majorId <= 0) {
      throw new InternalServerErrorException(
        `ID chuyên ngành không hợp lệ: ${majorId}`,
      );
    }

    const seqName = `student_code_seq_${year}_${majorId}`;

    try {
      const query = `
      CREATE SEQUENCE IF NOT EXISTS ${this.quoteIdentifier(seqName)}
      START WITH 1
      INCREMENT BY 1
      MINVALUE 1
      NO CYCLE;
    `;
      await this.studentRepository.query(query);
      console.log(`Sequence ${seqName} đã được đảm bảo tồn tại.`);
    } catch (error) {
      console.error(
        `Không thể tạo sequence ${seqName} cho năm học ${year}, chuyên ngành ${majorId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Không thể tạo sequence cho năm học ${year}, chuyên ngành ${majorId}.`,
      );
    }
  }

  /**
   * Hàm trợ giúp để đảm bảo tên định danh SQL an toàn.
   * @param identifier - Tên định danh (ví dụ: tên sequence).
   * @returns Tên định danh đã được quote an toàn.
   */
  private quoteIdentifier(identifier: string): string {
    if (identifier.length > 63) {
      throw new InternalServerErrorException(
        `Tên sequence quá dài: ${identifier}`,
      );
    }
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}
