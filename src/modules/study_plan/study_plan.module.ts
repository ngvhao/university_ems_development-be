import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanEntity } from './entities/study_plan.entity';
import { StudyPlanController } from './study_plan.controller';
import { StudyPlanService } from './study_plan.service';
import { SemesterModule } from '../semester/semester.module';
import { StudentModule } from '../student/student.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlanEntity]),
    SemesterModule,
    StudentModule,
    CourseModule,
  ],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
  exports: [StudyPlanService],
})
export class StudyPlanModule {}
