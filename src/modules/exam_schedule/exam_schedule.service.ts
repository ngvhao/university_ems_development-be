import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';
import { CreateExamScheduleDto } from './dtos/createExamSchedule.dto';
import { UpdateExamScheduleDto } from './dtos/updateExamSchedule.dto';
import { FilterExamScheduleDto } from './dtos/filterExamSchedule.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { StudentService } from '../student/student.service';
import { EExamType } from 'src/utils/enums/exam.enum';

@Injectable()
export class ExamScheduleService {
  constructor(
    @InjectRepository(ExamScheduleEntity)
    private readonly examScheduleRepository: Repository<ExamScheduleEntity>,
    private readonly studentService: StudentService,
    private dataSource: DataSource,
  ) {}

  /**
   * Lấy lịch thi của sinh viên theo mã học kỳ
   * @param studentId - ID của sinh viên
   * @param semesterCode - Mã học kỳ (ví dụ: '2024-1', '2024-2')
   * @returns Promise<ExamScheduleResponse[]> - Danh sách lịch thi
   */
  async getExamScheduleByStudentAndSemester(
    studentId: number,
    semesterCode: string,
  ): Promise<ExamScheduleEntity[]> {
    const semester = await this.dataSource
      .getRepository('SemesterEntity')
      .createQueryBuilder('semester')
      .where('semester.semesterCode = :semesterCode', { semesterCode })
      .getOne();

    if (!semester) {
      throw new NotFoundException(
        `Không tìm thấy học kỳ với mã: ${semesterCode}`,
      );
    }

    const examSchedules = await this.dataSource
      .getRepository('ExamScheduleEntity')
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('exam.room', 'room')
      .leftJoinAndSelect('exam.semester', 'semester')
      .leftJoin(
        'EnrollmentCourseEntity',
        'enrollment',
        'enrollment.classGroupId = classGroup.id',
      )
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('exam.semesterId = :semesterId', { semesterId: semester.id })
      .orderBy('exam.examDate', 'ASC')
      .addOrderBy('exam.startTime', 'ASC')
      .getMany();

    return examSchedules as ExamScheduleEntity[];
  }

  /**
   * Lấy lịch thi của sinh viên theo user ID và mã học kỳ
   * @param userId - ID của user
   * @param semesterCode - Mã học kỳ (ví dụ: '2024-1', '2024-2')
   * @returns Promise<ExamScheduleResponse[]> - Danh sách lịch thi
   */
  async getExamScheduleByUserAndSemester(
    userId: number,
    semesterCode: string,
  ): Promise<ExamScheduleEntity[]> {
    const student = await this.studentService.getOneByUserId(userId);

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy thông tin sinh viên cho user ID: ${userId}`,
      );
    }

    const data = await this.getExamScheduleByStudentAndSemester(
      student.id,
      semesterCode,
    );

    return data;
  }

  async create(
    createExamScheduleDto: CreateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    const examSchedule = this.examScheduleRepository.create(
      createExamScheduleDto,
    );
    return await this.examScheduleRepository.save(examSchedule);
  }

  async findAll(
    paginationDto: PaginationDto,
    filterDto?: FilterExamScheduleDto,
  ): Promise<{ data: ExamScheduleEntity[]; meta: MetaDataInterface }> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ExamScheduleEntity> = {};

    if (filterDto.examType) {
      where.examType = filterDto.examType as unknown as EExamType;
    }

    if (filterDto.examDate) {
      where.examDate = new Date(filterDto.examDate);
    }

    if (filterDto.classGroupId) {
      where.classGroupId = filterDto.classGroupId;
    }

    if (filterDto.facultyId) {
      where.classGroup = {
        course: {
          courseFaculties: {
            facultyId: filterDto.facultyId,
          },
        },
      };
    }

    if (filterDto.semesterId) {
      where.semesterId = filterDto.semesterId;
    }

    if (filterDto.roomId) {
      where.roomId = filterDto.roomId;
    }

    const [examSchedules, total] =
      await this.examScheduleRepository.findAndCount({
        where,
        relations: {
          classGroup: {
            course: true,
          },
          room: true,
          semester: true,
        },
        order: { examDate: 'ASC', startTime: 'ASC' },
        skip,
        take: limit,
      });

    const meta = generatePaginationMeta(total, page, limit);
    return { data: examSchedules, meta };
  }

  async findOne(id: number): Promise<ExamScheduleEntity> {
    const examSchedule = await this.examScheduleRepository.findOne({
      where: { id },
      relations: ['classGroup', 'room', 'semester'],
    });

    if (!examSchedule) {
      throw new NotFoundException(`Exam schedule with ID ${id} not found`);
    }

    return examSchedule;
  }

  async findByClassGroup(classGroupId: number): Promise<ExamScheduleEntity[]> {
    return await this.examScheduleRepository.find({
      where: { classGroupId },
      relations: ['classGroup', 'room', 'semester'],
      order: { examDate: 'ASC', startTime: 'ASC' },
    });
  }

  async findBySemester(semesterId: number): Promise<ExamScheduleEntity[]> {
    return await this.examScheduleRepository.find({
      where: { semesterId },
      relations: ['classGroup', 'room', 'semester'],
      order: { examDate: 'ASC', startTime: 'ASC' },
    });
  }

  async update(
    id: number,
    updateExamScheduleDto: UpdateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    const examSchedule = await this.findOne(id);

    Object.assign(examSchedule, updateExamScheduleDto);
    return await this.examScheduleRepository.save(examSchedule);
  }

  async remove(id: number): Promise<void> {
    const examSchedule = await this.findOne(id);
    await this.examScheduleRepository.remove(examSchedule);
  }
}
