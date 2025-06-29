import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFacultyService } from './course_faculty.service';
import { CourseFacultyController } from './course_faculty.controller';
import { CourseFacultyEntity } from './entities/course_faculty.entity';
import { CourseModule } from '../course/course.module';
import { FacultyModule } from '../faculty/faculty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseFacultyEntity]),
    forwardRef(() => CourseModule),
    forwardRef(() => FacultyModule),
  ],
  providers: [CourseFacultyService],
  controllers: [CourseFacultyController],
  exports: [CourseFacultyService],
})
export class CourseFacultyModule {}
