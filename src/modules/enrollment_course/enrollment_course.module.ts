import { Module } from '@nestjs/common';
import { EnrollmentCourseController } from './enrollment_course.controller';
import { EnrollmentCourseService } from './enrollment_course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentModule } from '../student/student.module';
import { CourseSemesterModule } from '../course_semester/course_semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentCourseEntity]),
    StudentModule,
    CourseSemesterModule,
  ],
  controllers: [EnrollmentCourseController],
  providers: [EnrollmentCourseService],
})
export class EnrollmentCourseModule {}
