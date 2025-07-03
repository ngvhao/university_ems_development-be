import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import _ from 'lodash';
import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { CreateStudentDto } from 'src/modules/student/dtos/createStudent.dto';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  EUserRole,
  EAccountStatus,
  EStudentStatus,
} from 'src/utils/enums/user.enum';
import { Helpers } from 'src/utils/helpers';
import { StudentHelper } from 'src/utils/helpers/student.helper';
import { DataSource } from 'typeorm';

/**
 * Tạo mới một sinh viên bao gồm cả việc tạo tài khoản người dùng liên kết.
 * Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu.
 * @param studentDTO - Dữ liệu để tạo sinh viên.
 * @param dataSource - Instance của database.
 * @returns Promise<Partial<UserEntity>> - Thông tin User mới tạo (không bao gồm password).
 * @throws BadRequestException - Nếu dữ liệu đầu vào không hợp lệ (email tồn tại, lớp không đủ thông tin).
 * @throws NotFoundException - Nếu không tìm thấy Lớp học với classId cung cấp.
 * @throws ConflictException - Nếu email (cá nhân, trường) hoặc mã sinh viên được tạo ra bị trùng.
 * @throws InternalServerErrorException - Nếu có lỗi xảy ra trong quá trình xử lý transaction hoặc tạo mã.
 */
export async function createStudent(
  studentDTO: CreateStudentDto,
  dataSource: DataSource,
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

  const queryRunner = dataSource.createQueryRunner();
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
      studentCode = await StudentHelper.generateStudentCode(
        dataSource,
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
    const existingUniEmail = await queryRunner.manager.findOne(UserEntity, {
      where: { universityEmail: uniEmail },
    });
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
    const savedUser = await queryRunner.manager.save(UserEntity, userToCreate);

    const studentToCreate: Partial<StudentEntity> = {
      studentCode: studentCode,
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
