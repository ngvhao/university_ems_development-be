import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { StudentEntity } from './entities/student.entity';
import { EUserRole } from 'src/utils/enums/user.enum';
import { ClassService } from '../class/class.service';
import { CreateStudentDto } from './dtos/createStudent.dto';
import { Helpers } from 'src/utils/helpers';
import _ from 'lodash';

@Injectable()
export class StudentService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(StudentEntity)
    private studentRepository: Repository<StudentEntity>,
    private classService: ClassService,
  ) {}

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
    // Creating and starting transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get class base on classId
      const classEntity = await this.classService.getOneByClassId({ classId });

      const { facultyCode } = classEntity.major.department.faculty;
      const majorId = classEntity.major.id;

      // Find total number of students in a specific major depends on classId
      const studentCount = await this.studentRepository.count({
        where: {
          major: { id: majorId },
          user: {
            role: EUserRole.STUDENT,
          },
          academicYear,
        },
      });

      // Generate studentCode
      const studentCode = await Helpers.generateUserCode(
        facultyCode,
        academicYear,
        studentCount,
      );

      // Create user
      const user = queryRunner.manager.create(UserEntity, {
        email,
        firstName,
        password: hashedPassword,
        lastName,
        userCode: studentCode,
        role: EUserRole.STUDENT,
      });

      await queryRunner.manager.save(user);

      // Create student
      const student = queryRunner.manager.create(StudentEntity, {
        user,
        major: { id: majorId },
        class: { id: classId },
        academicYear,
        enrollmentDate,
      });

      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();

      return _.omit(user, ['password']);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
