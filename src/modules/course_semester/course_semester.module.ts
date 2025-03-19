import { Module } from '@nestjs/common';
import { CourseSemesterController } from './course_semester.controller';
import { CourseSemesterService } from './course_semester.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSemesterEntity } from './entities/course_semester.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSemesterEntity]), StudentModule],
  controllers: [CourseSemesterController],
  providers: [CourseSemesterService],
  exports: [CourseSemesterService],
})
export class CourseSemesterModule {}
