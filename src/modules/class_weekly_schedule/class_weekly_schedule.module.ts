import { Module } from '@nestjs/common';
import { ClassWeeklyScheduleService } from './class_weekly_schedule.service';
import { ClassWeeklyScheduleController } from './class_weekly_schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassWeeklyScheduleEntity } from './entities/class_weekly_schedule.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassWeeklyScheduleEntity]),
    StudentModule,
  ],
  providers: [ClassWeeklyScheduleService],
  controllers: [ClassWeeklyScheduleController],
  exports: [ClassWeeklyScheduleService],
})
export class ClassWeeklyScheduleModule {}
