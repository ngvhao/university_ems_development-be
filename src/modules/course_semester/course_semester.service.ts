import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSemesterEntity } from './entities/course_semester.entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class CourseSemesterService {
  constructor(
    @InjectRepository(CourseSemesterEntity)
    private readonly courseSemesterRepository: Repository<CourseSemesterEntity>,
  ) {}

  async getCourseSemesterBySemesterId(
    semesterId: number,
  ): Promise<CourseSemesterEntity[]> {
    const courses = await this.courseSemesterRepository.find({
      where: {
        semester: {
          id: semesterId,
        },
      },
      relations: {
        course: true,
      },
    });
    return courses;
  }

  async getOne(
    condition:
      | FindOptionsWhere<CourseSemesterEntity>
      | FindOptionsWhere<CourseSemesterEntity>[],
    relations?: FindOptionsRelations<CourseSemesterEntity>,
  ): Promise<CourseSemesterEntity> {
    const courseSemester = await this.courseSemesterRepository.findOne({
      where: condition,
      relations,
    });
    if (!courseSemester) {
      throw new NotFoundException('No course found in this semester');
    }
    return courseSemester;
  }
}
