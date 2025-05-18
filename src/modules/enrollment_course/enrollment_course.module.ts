import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentCourseService } from './enrollment_course.service';
import { EnrollmentCourseController } from './enrollment_course.controller';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { StudentModule } from 'src/modules/student/student.module';
import { QueueModule } from 'src/common/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentCourseEntity]),
    forwardRef(() => StudentModule),
    QueueModule,
  ],
  controllers: [EnrollmentCourseController],
  providers: [EnrollmentCourseService],
  exports: [EnrollmentCourseService],
})
export class EnrollmentCourseModule {}
