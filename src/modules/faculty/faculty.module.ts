import { forwardRef, Module } from '@nestjs/common';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { FacultyEntity } from './entities/faculty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from '../department/department.module';
import { CourseModule } from '../course/course.module';
import { MajorModule } from '../major/major.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacultyEntity]),
    forwardRef(() => DepartmentModule),
    forwardRef(() => CourseModule),
    forwardRef(() => MajorModule),
  ],
  controllers: [FacultyController],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}
