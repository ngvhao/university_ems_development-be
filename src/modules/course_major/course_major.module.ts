import { Module, forwardRef } from '@nestjs/common';
import { CourseMajorController } from './course_major.controller';
import { CourseMajorService } from './course_major.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorModule } from '../major/major.module';
import { CourseModule } from '../course/course.module';
import { CourseMajorEntity } from './entities/course_major.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseMajorEntity]),
    forwardRef(() => MajorModule),
    forwardRef(() => CourseModule),
  ],
  controllers: [CourseMajorController],
  providers: [CourseMajorService],
  exports: [CourseMajorService],
})
export class CourseMajorModule {}
