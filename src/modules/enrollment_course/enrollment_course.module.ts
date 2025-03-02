import { Module } from '@nestjs/common';
import { EnrollmentCourseController } from './enrollment_course.controller';
import { EnrollmentCourseService } from './enrollment_course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentCourseEntity])],
  controllers: [EnrollmentCourseController],
  providers: [EnrollmentCourseService],
})
export class EnrollmentCourseModule {}
