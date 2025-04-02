// src/modules/student/student.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { EUserRole } from 'src/utils/enums/user.enum';
import { CreateStudentDto } from './dtos/createStudent.dto';
import _ from 'lodash';
import { UserService } from '../user/user.service';
import { ClassEntity } from '../class/entities/class.entity';
import { FilterStudentDto } from './dtos/filterStudent.dto';
import { UpdateStudentDto } from './dtos/updateStudent.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
@Injectable()
export class StudentService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    private userService: UserService,
  ) {}

  // --- Hàm CREATE đã có ---
  async createStudent(
    studentDTO: CreateStudentDto,
    hashedPassword: string,
  ): Promise<Partial<UserEntity>> {
    const {
      email,
      firstName,
      lastName,
      classId,
      academicYear,
      enrollmentDate,
    } = studentDTO;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra email tồn tại (đã làm ở controller, nhưng có thể check lại trong transaction)
      const existingUser = await queryRunner.manager.findOneBy(UserEntity, {
        email,
      });
      if (existingUser) {
        throw new BadRequestException(`Email '${email}' đã tồn tại.`);
      }

      // Lấy thông tin lớp và kiểm tra tồn tại
      const classEntity = await queryRunner.manager.findOne(ClassEntity, {
        where: { id: classId },
        relations: { major: { department: { faculty: true } } }, // Load đủ quan hệ cần thiết
      });
      if (!classEntity) {
        throw new NotFoundException(`Không tìm thấy lớp với ID ${classId}`);
      }
      if (!classEntity.major?.department?.faculty) {
        throw new BadRequestException(
          `Thông tin Khoa/Bộ môn/Chuyên ngành của lớp ${classId} không đầy đủ.`,
        );
      }

      const { facultyCode } = classEntity.major.department.faculty;
      const majorId = classEntity.major.id;

      // Tạo mã sinh viên
      const studentCode = await this.userService.generateStudentCode(
        facultyCode,
        academicYear,
        majorId,
      );

      // Tạo user
      const user = queryRunner.manager.create(UserEntity, {
        email,
        firstName,
        password: hashedPassword,
        lastName,
        userCode: studentCode,
        role: EUserRole.STUDENT,
        // Các trường khác có thể thêm nếu cần
      });
      const savedUser = await queryRunner.manager.save(user);

      // Tạo student
      const student = queryRunner.manager.create(StudentEntity, {
        userId: savedUser.id, // Gán userId mới tạo
        majorId: majorId,
        classId: classId,
        academicYear,
        enrollmentDate: new Date(enrollmentDate), // Chuyển string thành Date
        // expectedGraduationDate có thể tính toán hoặc để null
      });
      await queryRunner.manager.save(student);

      await queryRunner.commitTransaction();

      return _.omit(savedUser, ['password']); // Trả về thông tin user đã tạo
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Log lỗi ra để debug nếu cần
      console.error('Error creating student:', error);
      // Ném lại lỗi để controller hoặc exception filter xử lý
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Hàm READ (All with Pagination and Filter) ---
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

    // Join với các bảng liên quan để lấy thông tin và lọc
    queryBuilder
      .innerJoinAndSelect('student.user', 'user') // Join và lấy thông tin user
      .innerJoinAndSelect('student.class', 'class') // Join và lấy thông tin lớp
      .innerJoinAndSelect('student.major', 'major'); // Join và lấy thông tin ngành

    // Áp dụng bộ lọc
    if (search) {
      const searchTerm = `%${search}%`;
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.userCode ILIKE :search OR user.email ILIKE :search)',
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

    // Sắp xếp (ví dụ: theo tên user)
    queryBuilder
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC');

    // Phân trang
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const meta = generatePaginationMeta(total, page, limit);

    // Omit password trước khi trả về (an toàn hơn)
    const sanitizedData = data.map((s) => ({
      ...s,
      user: _.omit(s.user, ['password']) as UserEntity,
    }));

    return { data: sanitizedData, meta };
  }

  // --- Hàm READ (One by ID) ---
  async findOneById(id: number): Promise<StudentEntity> {
    // Sử dụng query builder để dễ dàng join và chọn lọc
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.user', 'user')
      .innerJoinAndSelect('student.class', 'class')
      .innerJoinAndSelect('student.major', 'major')
      .leftJoinAndSelect('major.department', 'department') // Lấy thêm department nếu cần
      .leftJoinAndSelect('department.faculty', 'faculty') // Lấy thêm faculty nếu cần
      .where('student.id = :id', { id })
      .getOne();

    if (!student) {
      throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
    }
    if (student.user) {
      student.user = _.omit(student.user, ['password']) as UserEntity;
    }
    return student;
  }

  // --- Hàm UPDATE ---
  async update(
    id: number, // ID của StudentEntity
    updateDto: UpdateStudentDto,
  ): Promise<StudentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tìm student và user liên quan
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id },
        relations: ['user', 'class'], // Load user và class hiện tại
      });

      if (!student) {
        throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
      }
      if (!student.user) {
        throw new NotFoundException(
          `Không tìm thấy thông tin user liên kết với sinh viên ID ${id}`,
        );
      }

      const userId = student.user.id;

      const {
        classId,
        academicYear,
        gpa,
        expectedGraduationDate,
        ...userUpdateData
      } = updateDto;

      const studentUpdateData: Partial<StudentEntity> = {};
      if (academicYear !== undefined)
        studentUpdateData.academicYear = academicYear;
      if (gpa !== undefined) studentUpdateData.gpa = gpa;
      if (expectedGraduationDate !== undefined)
        studentUpdateData.expectedGraduationDate = expectedGraduationDate
          ? new Date(expectedGraduationDate)
          : null;

      // 3. Xử lý thay đổi lớp (nếu có)
      if (classId !== undefined && classId !== student.classId) {
        const newClass = await queryRunner.manager.findOne(ClassEntity, {
          where: { id: classId },
          relations: ['major'],
        });
        if (!newClass) {
          throw new NotFoundException(
            `Không tìm thấy lớp mới với ID ${classId}`,
          );
        }
        if (!newClass.major) {
          throw new BadRequestException(
            `Lớp mới với ID ${classId} không có thông tin chuyên ngành.`,
          );
        }
        studentUpdateData.classId = classId;
        studentUpdateData.majorId = newClass.major.id; // Cập nhật majorId theo lớp mới
        // Cập nhật biến này để dùng nếu cần regenerate student code
        // Lưu ý: Có thể cần logic phức tạp hơn nếu việc đổi lớp/ngành cần cập nhật lại mã sinh viên
      }

      // 4. Cập nhật UserEntity (chỉ cập nhật các trường có giá trị)
      const cleanUserUpdateData = _.omitBy(userUpdateData, _.isNil); // Loại bỏ các key có value là null/undefined
      // Chuyển đổi Date string sang Date object nếu có
      if (cleanUserUpdateData.dateOfBirth) {
        cleanUserUpdateData.dateOfBirth = new Date(
          cleanUserUpdateData.dateOfBirth,
        );
      }

      if (Object.keys(cleanUserUpdateData).length > 0) {
        await queryRunner.manager.update(
          UserEntity,
          userId,
          cleanUserUpdateData,
        );
      }

      // 5. Cập nhật StudentEntity (chỉ cập nhật các trường có giá trị)
      const cleanStudentUpdateData = _.omitBy(studentUpdateData, _.isNil);
      if (Object.keys(cleanStudentUpdateData).length > 0) {
        await queryRunner.manager.update(
          StudentEntity,
          id,
          cleanStudentUpdateData,
        );
      }

      await queryRunner.commitTransaction();

      return this.findOneById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating student:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Hàm DELETE ---
  async remove(id: number): Promise<void> {
    // Do đã thiết lập onDelete: 'CASCADE' trên StudentEntity.user
    // nên khi xóa UserEntity, StudentEntity liên quan cũng sẽ tự động bị xóa bởi DB.
    // Do đó, chỉ cần xóa UserEntity tương ứng là đủ.

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tìm student để lấy userId
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id },
        select: ['id', 'userId'], // Chỉ cần lấy id và userId
      });

      if (!student) {
        throw new NotFoundException(`Không tìm thấy sinh viên với ID ${id}`);
      }

      // 2. Xóa UserEntity bằng userId
      const deleteResult = await queryRunner.manager.delete(
        UserEntity,
        student.userId,
      );

      if (deleteResult.affected === 0) {
        // Trường hợp hy hữu: student tồn tại nhưng user không tồn tại?
        throw new NotFoundException(
          `Không tìm thấy user liên kết với sinh viên ID ${id} để xóa`,
        );
      }
      // Không cần xóa StudentEntity riêng vì cascade delete sẽ xử lý

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error removing student:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Hàm getOne đã có ---
  // Có thể giữ lại hoặc thay thế bằng findOneById nếu logic tương tự
  async getOne(
    condition:
      | FindOptionsWhere<StudentEntity>
      | FindOptionsWhere<StudentEntity>[],
    relations?: FindOptionsRelations<StudentEntity>,
  ): Promise<StudentEntity | null> {
    // Trả về null nếu không tìm thấy thay vì lỗi
    const student = await this.studentRepository.findOne({
      where: condition,
      relations: relations,
    });
    if (student?.user) {
      student.user = _.omit(student.user, ['password']) as UserEntity;
    }
    return student;
  }
}
