import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentCourseService } from './enrollment_course.service';
import { EnrollmentCourseController } from './enrollment_course.controller';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentModule } from 'src/modules/student/student.module';
import { ClassGroupModule } from 'src/modules/class_group/class_group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentCourseEntity]),
    forwardRef(() => StudentModule),
    forwardRef(() => ClassGroupModule),
  ],
  controllers: [EnrollmentCourseController],
  providers: [EnrollmentCourseService],
  exports: [EnrollmentCourseService],
})
export class EnrollmentCourseModule {}
