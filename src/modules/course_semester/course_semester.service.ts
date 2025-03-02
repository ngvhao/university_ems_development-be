import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSemesterEntity } from './entities/course_semester.entity';
import { Repository } from 'typeorm';

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
}
