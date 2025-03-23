// src/modules/semester/semester.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SemesterEntity } from './entities/semester.entity';
import { CreateSemesterDto } from './dtos/createSemester.dto';
import { UpdateSemesterDto } from './dtos/updateSemester.dto';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

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

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: SemesterEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.semesterRepository.findAndCount({
      relations: ['courseSemesters'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
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
