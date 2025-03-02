import { Module } from '@nestjs/common';
import { CourseSemesterController } from './course_semester.controller';
import { CourseSemesterService } from './course_semester.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSemesterEntity } from './entities/course_semester.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSemesterEntity])],
  controllers: [CourseSemesterController],
  providers: [CourseSemesterService],
})
export class CourseSemesterModule {}
