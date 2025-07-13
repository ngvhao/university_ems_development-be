import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';
import { CreateExamScheduleDto } from './dtos/createExamSchedule.dto';
import { UpdateExamScheduleDto } from './dtos/updateExamSchedule.dto';
import { FilterExamScheduleDto } from './dtos/filterExamSchedule.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { EExamType } from 'src/utils/enums/exam.enum';

interface ExamScheduleResponse {
  id: number;
  examType: EExamType;
  examDate: Date;
  startTime: string;
  endTime: string;
  notes: string | null;
  course: {
    id: number;
    courseCode: string;
    name: string;
    credit: number;
  };
  classGroup: {
    id: number;
    classGroupCode: string;
  };
  room: {
    id: number;
    roomCode: string;
    roomName: string;
    building: string;
    floor: number;
  };
  semester: {
    id: number;
    semesterCode: string;
    semesterName: string;
  };
}

@Injectable()
export class ExamScheduleService {
  constructor(
    @InjectRepository(ExamScheduleEntity)
    private examScheduleRepository: Repository<ExamScheduleEntity>,
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
  ): Promise<ExamScheduleResponse[]> {
    // Tìm học kỳ theo semester code
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

    // Lấy lịch thi của sinh viên trong học kỳ đó
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

    return examSchedules.map((exam) => ({
      id: exam.id,
      examType: exam.examType,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      notes: exam.notes,
      course: {
        id: exam.classGroup.course.id,
        courseCode: exam.classGroup.course.courseCode,
        name: exam.classGroup.course.name,
        credit: exam.classGroup.course.credit,
      },
      classGroup: {
        id: exam.classGroup.id,
        classGroupCode: exam.classGroup.classGroupCode,
      },
      room: {
        id: exam.room.id,
        roomCode: exam.room.roomCode,
        roomName: exam.room.roomName,
        building: exam.room.building,
        floor: exam.room.floor,
      },
      semester: {
        id: exam.semester.id,
        semesterCode: exam.semester.semesterCode,
        semesterName: exam.semester.semesterName,
      },
    }));
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
  ): Promise<ExamScheduleResponse[]> {
    // Tìm student theo user ID
    const student = await this.dataSource
      .getRepository('StudentEntity')
      .createQueryBuilder('student')
      .where('student.userId = :userId', { userId })
      .getOne();

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy thông tin sinh viên cho user ID: ${userId}`,
      );
    }

    return this.getExamScheduleByStudentAndSemester(student.id, semesterCode);
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

    const query = this.examScheduleRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.classGroup', 'classGroup')
      .leftJoinAndSelect('classGroup.course', 'course')
      .leftJoinAndSelect('exam.room', 'room')
      .leftJoinAndSelect('exam.semester', 'semester');

    if (filterDto.examType) {
      query.andWhere('exam.examType = :examType', {
        examType: filterDto.examType,
      });
    }

    if (filterDto.examDate) {
      query.andWhere('exam.examDate = :examDate', {
        examDate: filterDto.examDate,
      });
    }

    if (filterDto.classGroupId) {
      query.andWhere('exam.classGroupId = :classGroupId', {
        classGroupId: filterDto.classGroupId,
      });
    }

    if (filterDto.roomId) {
      query.andWhere('exam.roomId = :roomId', { roomId: filterDto.roomId });
    }

    if (filterDto.semesterId) {
      query.andWhere('exam.semesterId = :semesterId', {
        semesterId: filterDto.semesterId,
      });
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    const meta = generatePaginationMeta(page, limit, total);
    return { data, meta };
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
