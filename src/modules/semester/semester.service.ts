// src/modules/semester/semester.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemesterEntity } from './entities/semester.entity';
import { CreateSemesterDto } from './dtos/createSemester.dto';
import { UpdateSemesterDto } from './dtos/updateSemester.dto';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(SemesterEntity)
    private semesterRepository: Repository<SemesterEntity>,
  ) {}

  async create(createSemesterDto: CreateSemesterDto): Promise<SemesterEntity> {
    const semester = this.semesterRepository.create(createSemesterDto);
    return this.semesterRepository.save(semester);
  }

  async findAll(): Promise<SemesterEntity[]> {
    return this.semesterRepository.find({
      relations: ['courseSemesters'],
    });
  }

  async findOne(id: number): Promise<SemesterEntity> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['courseSemesters'],
    });
    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }
    return semester;
  }

  async update(
    id: number,
    updateSemesterDto: UpdateSemesterDto,
  ): Promise<SemesterEntity> {
    const semester = await this.findOne(id);
    Object.assign(semester, updateSemesterDto);
    return this.semesterRepository.save(semester);
  }

  async remove(id: number): Promise<void> {
    const semester = await this.findOne(id);
    await this.semesterRepository.remove(semester);
  }
}
