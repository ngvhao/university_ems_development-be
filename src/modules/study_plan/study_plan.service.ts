import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudyPlanDto } from './dtos/createStudyPlan.dto';
import { UpdateStudyPlanDto } from './dtos/updateStudyPlan.dto';
import { StudyPlanEntity } from './entities/study_plan.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlanEntity)
    private readonly studyPlanRepository: Repository<StudyPlanEntity>,
  ) {}

  async create(
    createStudyPlanDto: CreateStudyPlanDto,
  ): Promise<StudyPlanEntity> {
    const studyPlan = this.studyPlanRepository.create({
      ...createStudyPlanDto,
      student: { id: createStudyPlanDto.studentId },
      semester: { id: createStudyPlanDto.semesterId },
      course: { id: createStudyPlanDto.courseId },
    });
    return this.studyPlanRepository.save(studyPlan);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: StudyPlanEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.studyPlanRepository.findAndCount({
      relations: ['student', 'semester', 'course'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<StudyPlanEntity> {
    const studyPlan = await this.studyPlanRepository.findOne({
      where: { id },
      relations: ['student', 'semester', 'course'],
    });
    if (!studyPlan) {
      throw new NotFoundException(`StudyPlan with ID ${id} not found`);
    }
    return studyPlan;
  }

  async update(
    id: number,
    updateStudyPlanDto: UpdateStudyPlanDto,
  ): Promise<StudyPlanEntity> {
    const studyPlan = await this.findOne(id);
    if (updateStudyPlanDto.studentId) {
      updateStudyPlanDto['student'] = { id: updateStudyPlanDto.studentId };
      delete updateStudyPlanDto.studentId;
    }
    if (updateStudyPlanDto.semesterId) {
      updateStudyPlanDto['semester'] = { id: updateStudyPlanDto.semesterId };
      delete updateStudyPlanDto.semesterId;
    }
    if (updateStudyPlanDto.courseId) {
      updateStudyPlanDto['course'] = { id: updateStudyPlanDto.courseId };
      delete updateStudyPlanDto.courseId;
    }
    Object.assign(studyPlan, updateStudyPlanDto);
    return this.studyPlanRepository.save(studyPlan);
  }

  async remove(id: number): Promise<void> {
    const studyPlan = await this.findOne(id);
    await this.studyPlanRepository.remove(studyPlan);
  }
}
