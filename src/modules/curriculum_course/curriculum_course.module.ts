import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumCourseEntity } from './entities/curriculum_course.entity';
import { CurriculumCourseController } from './curriculum_course.controller';
import { CurriculumCourseService } from './curriculum_course.service';

@Module({
  imports: [TypeOrmModule.forFeature([CurriculumCourseEntity])],
  controllers: [CurriculumCourseController],
  providers: [CurriculumCourseService],
  exports: [CurriculumCourseService],
})
export class CurriculumCourseModule {}
