import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanEntity } from './entities/study_plan.entity';
import { StudyPlanController } from './study_plan.controller';
import { StudyPlanService } from './study_plan.service';
import { SemesterModule } from '../semester/semester.module';
import { StudentModule } from '../student/student.module';
import { CourseModule } from '../course/course.module';
import { LecturerCourseModule } from '../lecturer_course/lecturer_course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { SettingModule } from '../setting/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlanEntity]),
    SemesterModule,
    forwardRef(() => StudentModule),
    forwardRef(() => CourseModule),
    LecturerCourseModule,
    CurriculumModule,
    SettingModule,
  ],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
  exports: [StudyPlanService],
})
export class StudyPlanModule {}
