import { forwardRef, Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { DepartmentEntity } from './entities/department.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyModule } from '../faculty/faculty.module';
import { LecturerModule } from '../lecturer/lecturer.module';
import { MajorModule } from '../major/major.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartmentEntity]),
    forwardRef(() => FacultyModule),
    forwardRef(() => LecturerModule),
    forwardRef(() => MajorModule),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
