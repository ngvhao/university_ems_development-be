import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeDetailService } from './grade_detail.service';
import { GradeDetailController } from './grade_detail.controller';
import { GradeDetailEntity } from './entities/grade_detail.entity';
import { EnrollmentCourseModule } from '../enrollment_course/enrollment_course.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeDetailEntity]),
    EnrollmentCourseModule,
    forwardRef(() => StudentModule),
  ],
  controllers: [GradeDetailController],
  providers: [GradeDetailService],
  exports: [GradeDetailService],
})
export class GradeDetailModule {}
