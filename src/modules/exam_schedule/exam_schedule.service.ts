import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';
import { CreateExamScheduleDto } from './dtos/createExamSchedule.dto';
import { UpdateExamScheduleDto } from './dtos/updateExamSchedule.dto';

@Injectable()
export class ExamScheduleService {
  constructor(
    @InjectRepository(ExamScheduleEntity)
    private examScheduleRepository: Repository<ExamScheduleEntity>,
  ) {}

  async create(
    createExamScheduleDto: CreateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    const examSchedule = this.examScheduleRepository.create(
      createExamScheduleDto,
    );
    return await this.examScheduleRepository.save(examSchedule);
  }

  async findAll(): Promise<ExamScheduleEntity[]> {
    return await this.examScheduleRepository.find({
      relations: ['classGroup', 'room', 'semester'],
    });
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
