import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseDto } from './dtos/createCourse.dto';
import { UpdateCourseDto } from './dtos/updateCourse.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<CourseEntity[]> {
    return this.courseRepository.find({
      relations: ['major', 'prerequisite', 'courseSemesters'],
    });
  }

  async findOne(id: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['major', 'prerequisite', 'courseSemesters'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
