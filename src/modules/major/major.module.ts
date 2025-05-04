import { forwardRef, Module } from '@nestjs/common';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { MajorEntity } from './entities/major.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from '../student/student.module';
import { ClassModule } from '../class/class.module';
import { CurriculumCourseModule } from '../curriculum_course/curriculum_course.module';
import { CourseMajorModule } from '../course_major/course_major.module';
import { DepartmentModule } from '../department/department.module';
import { CurriculumModule } from '../curriculum/curriculum.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MajorEntity]),
    forwardRef(() => StudentModule),
    forwardRef(() => ClassModule),
    CurriculumCourseModule,
    CourseMajorModule,
    DepartmentModule,
    CurriculumModule,
  ],
  controllers: [MajorController],
  providers: [MajorService],
  exports: [MajorService],
})
export class MajorModule {}
