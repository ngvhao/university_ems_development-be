import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentCourseService } from './enrollment_course.service';
import { EnrollmentCourseController } from './enrollment_course.controller';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentModule } from 'src/modules/student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentCourseEntity]),
    forwardRef(() => StudentModule),
  ],
  controllers: [EnrollmentCourseController],
  providers: [EnrollmentCourseService],
  exports: [EnrollmentCourseService],
})
export class EnrollmentCourseModule {}
