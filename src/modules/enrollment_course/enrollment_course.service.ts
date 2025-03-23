import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { UpdateEnrollmentCourseDto } from './dtos/updateEnrollmentCourse.dto';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { StudentService } from '../student/student.service';
import { CourseSemesterService } from '../course_semester/course_semester.service';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class EnrollmentCourseService {
  constructor(
    @InjectRepository(EnrollmentCourseEntity)
    private readonly enrollmentCourseRepository: Repository<EnrollmentCourseEntity>,
    private readonly studentService: StudentService,
    private readonly courseSemesterService: CourseSemesterService,
  ) {}

  async create(
    createEnrollmentCourseDto: CreateEnrollmentCourseDto,
  ): Promise<EnrollmentCourseEntity> {
    const { studentId, courseSemesterId, status } = createEnrollmentCourseDto;

    const student = await this.studentService.getOne(
      { id: studentId },
      { major: true },
    );
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const courseSemester = await this.courseSemesterService.getOne({
      id: courseSemesterId,
      course: {
        major: {
          id: student.major.id,
        },
      },
    });
    if (!courseSemester) {
      throw new NotFoundException(
        `Course Semester with ID ${courseSemesterId} not found`,
      );
    }

    try {
      const enrollment = this.enrollmentCourseRepository.create({
        student,
        courseSemester,
        status,
      });
      return await this.enrollmentCourseRepository.save(enrollment);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Enrollment already exists for this student and course',
        );
      }
      throw error;
    }
  }

  async getMany(
    condition:
      | FindOptionsWhere<EnrollmentCourseEntity>
      | FindOptionsWhere<EnrollmentCourseEntity>[],
    paginationDto: PaginationDto,
    relations?: FindOptionsRelations<EnrollmentCourseEntity>,
  ): Promise<{ data: EnrollmentCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.enrollmentCourseRepository.findAndCount({
      where: condition,
      relations,
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findAll(): Promise<EnrollmentCourseEntity[]> {
    return this.enrollmentCourseRepository.find({
      relations: ['student', 'courseSemester'],
    });
  }

  async findOne(id: number): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.enrollmentCourseRepository.findOne({
      where: { id },
      relations: ['student', 'courseSemester'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(
    id: number,
    updateEnrollmentCourseDto: UpdateEnrollmentCourseDto,
  ): Promise<EnrollmentCourseEntity> {
    const enrollment = await this.findOne(id);

    if (updateEnrollmentCourseDto.studentId) {
      const student = await this.studentService.getOne({
        id: updateEnrollmentCourseDto.studentId,
      });
      if (!student) {
        throw new NotFoundException(
          `Student with ID ${updateEnrollmentCourseDto.studentId} not found`,
        );
      }
      enrollment.student = student;
    }

    if (updateEnrollmentCourseDto.courseSemesterId) {
      const courseSemester = await this.courseSemesterService.getOne({
        id: updateEnrollmentCourseDto.courseSemesterId,
      });
      if (!courseSemester) {
        throw new NotFoundException(
          `Course Semester with ID ${updateEnrollmentCourseDto.courseSemesterId} not found`,
        );
      }
      enrollment.courseSemester = courseSemester;
    }

    Object.assign(enrollment, updateEnrollmentCourseDto);
    return this.enrollmentCourseRepository.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    await this.enrollmentCourseRepository.delete(id);
  }
}
