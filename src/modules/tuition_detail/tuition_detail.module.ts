import { Module } from '@nestjs/common';
import { TuitionDetailController } from './tuition_detail.controller';
import { TuitionDetailService } from './tuition_detail.service';
import { TuitionModule } from '../tuition/tuition.module';
import { EnrollmentCourseModule } from '../enrollment_course/enrollment_course.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuitionDetailEntity } from './entities/tuition_detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TuitionDetailEntity]),
    TuitionModule,
    EnrollmentCourseModule,
  ],
  controllers: [TuitionDetailController],
  providers: [TuitionDetailService],
  exports: [TuitionDetailService],
})
export class TuitionDetailModule {}
