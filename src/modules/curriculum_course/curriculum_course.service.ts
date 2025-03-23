import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCurriculumCourseDto } from './dtos/createCurriculumCourse.dto';
import { UpdateCurriculumCourseDto } from './dtos/updateCurriculumCourse.dto';
import { CurriculumCourseEntity } from './entities/curriculum_course.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class CurriculumCourseService {
  constructor(
    @InjectRepository(CurriculumCourseEntity)
    private readonly curriculumCourseRepository: Repository<CurriculumCourseEntity>,
  ) {}

  async create(
    createCurriculumCourseDto: CreateCurriculumCourseDto,
  ): Promise<CurriculumCourseEntity> {
    const curriculumCourse = this.curriculumCourseRepository.create({
      ...createCurriculumCourseDto,
      curriculum: { id: createCurriculumCourseDto.curriculumId },
      course: { id: createCurriculumCourseDto.courseId },
      semester: { id: createCurriculumCourseDto.semesterId },
    });
    return this.curriculumCourseRepository.save(curriculumCourse);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: CurriculumCourseEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.curriculumCourseRepository.findAndCount({
      relations: ['curriculum', 'course', 'semester'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<CurriculumCourseEntity> {
    const curriculumCourse = await this.curriculumCourseRepository.findOne({
      where: { id },
      relations: ['curriculum', 'course', 'semester'],
    });
    if (!curriculumCourse) {
      throw new NotFoundException(`CurriculumCourse with ID ${id} not found`);
    }
    return curriculumCourse;
  }

  async update(
    id: number,
    updateCurriculumCourseDto: UpdateCurriculumCourseDto,
  ): Promise<CurriculumCourseEntity> {
    const curriculumCourse = await this.findOne(id);
    if (updateCurriculumCourseDto.curriculumId) {
      updateCurriculumCourseDto['curriculum'] = {
        id: updateCurriculumCourseDto.curriculumId,
      };
      delete updateCurriculumCourseDto.curriculumId;
    }
    if (updateCurriculumCourseDto.courseId) {
      updateCurriculumCourseDto['course'] = {
        id: updateCurriculumCourseDto.courseId,
      };
      delete updateCurriculumCourseDto.courseId;
    }
    if (updateCurriculumCourseDto.semesterId) {
      updateCurriculumCourseDto['semester'] = {
        id: updateCurriculumCourseDto.semesterId,
      };
      delete updateCurriculumCourseDto.semesterId;
    }
    Object.assign(curriculumCourse, updateCurriculumCourseDto);
    return this.curriculumCourseRepository.save(curriculumCourse);
  }

  async remove(id: number): Promise<void> {
    const curriculumCourse = await this.findOne(id);
    await this.curriculumCourseRepository.remove(curriculumCourse);
  }
}
