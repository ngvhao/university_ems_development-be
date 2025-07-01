import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamScheduleService } from './exam_schedule.service';
import { ExamScheduleController } from './exam_schedule.controller';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamScheduleEntity])],
  controllers: [ExamScheduleController],
  providers: [ExamScheduleService],
  exports: [ExamScheduleService],
})
export class ExamScheduleModule {}
