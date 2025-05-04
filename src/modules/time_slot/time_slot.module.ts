import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlotEntity } from './entities/time_slot.entity';
import { TimeSlotController } from './time_slot.controller';
import { TimeSlotService } from './time_slot.service';
import { ClassWeeklyScheduleModule } from '../class_weekly_schedule/class_weekly_schedule.module';
import { ClassAdjustmentScheduleModule } from '../class_adjustment_schedule/class_adjustment_schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeSlotEntity]),
    forwardRef(() => ClassWeeklyScheduleModule),
    forwardRef(() => ClassAdjustmentScheduleModule),
  ],
  controllers: [TimeSlotController],
  providers: [TimeSlotService],
  exports: [TimeSlotService],
})
export class TimeSlotModule {}
