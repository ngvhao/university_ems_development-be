import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturerCourseEntity } from './entities/lecturer_course.entity';
import { LecturerCourseController } from './lecturer_course.controller';
import { LecturerCourseService } from './lecturer_course.service';
import { CourseModule } from '../course/course.module';
import { LecturerModule } from '../lecturer/lecturer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LecturerCourseEntity]),
    forwardRef(() => CourseModule),
    LecturerModule,
  ],
  controllers: [LecturerCourseController],
  providers: [LecturerCourseService],
  exports: [LecturerCourseService],
})
export class LecturerCourseModule {}
