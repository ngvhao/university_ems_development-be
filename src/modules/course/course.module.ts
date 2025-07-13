import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseEntity } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { ClassGroupModule } from '../class_group/class_group.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), ClassGroupModule],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
