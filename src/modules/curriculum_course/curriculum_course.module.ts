import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumCourseEntity } from './entities/curriculum_course.entity';
import { CurriculumCourseController } from './curriculum_course.controller';
import { CurriculumCourseService } from './curriculum_course.service';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { CourseModule } from '../course/course.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurriculumCourseEntity]),
    forwardRef(() => CurriculumModule),
    forwardRef(() => CourseModule),
    forwardRef(() => SemesterModule),
  ],
  controllers: [CurriculumCourseController],
  providers: [CurriculumCourseService],
  exports: [CurriculumCourseService],
})
export class CurriculumCourseModule {}
