import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { CreateEnrollmentCourseDto } from 'src/modules/enrollment_course/dtos/createEnrollmentCourse.dto';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { EUserRole } from 'src/utils/enums/user.enum';
import { DataSource } from 'typeorm';

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
export async function enrollClassGroup(
  createDto: CreateEnrollmentCourseDto & { role: EUserRole; id: number },
  dataSource: DataSource,
): Promise<EnrollmentCourseEntity> {
  const { classGroupId, role, id } = createDto;
  let studentId = createDto.studentId;
  let majorId: number | null = null;
  let startAcademicYear: number | null = null;

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Trường hợp sinh viên tự đăng ký
    if (!studentId) {
      if (role !== EUserRole.STUDENT) {
        throw new ForbiddenException('Chỉ sinh viên mới có thể tự đăng ký.');
      }

      const studentProfile = await queryRunner.manager.findOne(UserEntity, {
        where: {
          id: id,
          role: EUserRole.STUDENT,
        },
        relations: ['studentProfile'],
      });

      if (!studentProfile?.student) {
        throw new ForbiddenException(
          'Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên.',
        );
      }

      studentId = studentProfile.student.id;
      majorId = studentProfile.student.majorId;
      startAcademicYear = studentProfile.student.academicYear;
    } else {
      // Trường hợp admin/manager đăng ký hộ
      if (
        ![EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER].includes(role)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền đăng ký cho sinh viên khác.',
        );
      }

      const studentProfile = await queryRunner.manager.findOne(UserEntity, {
        where: {
          id: studentId,
          role: EUserRole.STUDENT,
        },
        relations: ['studentProfile'],
      });

      if (!studentProfile?.student) {
        throw new NotFoundException(
          `Không tìm thấy hồ sơ sinh viên với ID ${studentId}`,
        );
      }

      majorId = studentProfile.student.majorId;
      startAcademicYear = studentProfile.student.academicYear;
    }

    // Lock ClassGroup để kiểm tra
    const classGroup = await queryRunner.manager.findOne(ClassGroupEntity, {
      where: {
        id: classGroupId,
        course: {
          curriculumCourses: {
            curriculum: {
              majorId,
              startAcademicYear,
            },
          },
        },
      },
      lock: { mode: 'pessimistic_write' },
      relations: [
        'course',
        'course.curriculumCourses',
        'course.curriculumCourses.curriculum',
      ],
    });

    if (!classGroup) {
      throw new NotFoundException(
        `Không tìm thấy Nhóm lớp học với ID ${classGroupId}`,
      );
    }

    if (classGroup.status !== EClassGroupStatus.OPEN) {
      throw new BadRequestException(
        `Nhóm lớp học ID ${classGroupId} không mở để đăng ký.`,
      );
    }

    if (classGroup.registeredStudents >= classGroup.maxStudents) {
      throw new BadRequestException(`Nhóm lớp học ID ${classGroupId} đã đầy.`);
    }

    // Kiểm tra sinh viên đã đăng ký chưa
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
        `Sinh viên ID ${studentId} đã đăng ký nhóm lớp ID ${classGroupId}.`,
      );
    }

    // Tạo đăng ký mới
    const newEnrollment = queryRunner.manager.create(EnrollmentCourseEntity, {
      studentId,
      classGroupId,
      status: EEnrollmentStatus.ENROLLED,
    });

    const savedEnrollment = await queryRunner.manager.save(newEnrollment);

    // Cập nhật số lượng
    await queryRunner.manager.increment(
      ClassGroupEntity,
      { id: classGroupId },
      'registeredStudents',
      1,
    );

    if (classGroup.registeredStudents + 1 === classGroup.maxStudents) {
      await queryRunner.manager.update(ClassGroupEntity, classGroupId, {
        status: EClassGroupStatus.CLOSED,
      });
    }

    await queryRunner.commitTransaction();

    // Lấy lại bản ghi enrollment kèm relations (student, classGroup)
    return await queryRunner.manager.findOneOrFail(EnrollmentCourseEntity, {
      where: { id: savedEnrollment.id },
      relations: ['student', 'classGroup'],
    });
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
