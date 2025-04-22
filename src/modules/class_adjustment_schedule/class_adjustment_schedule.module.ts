import { Module } from '@nestjs/common';
import { ClassAdjustmentScheduleService } from './class_adjustment_schedule.service';
import { ClassAdjustmentScheduleController } from './class_adjustment_schedule.controller';
import { ClassAdjustmentScheduleEntity } from './entities/class_adjustment_schedule.dto';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClassAdjustmentScheduleEntity])],
  providers: [ClassAdjustmentScheduleService],
  controllers: [ClassAdjustmentScheduleController],
  exports: [ClassAdjustmentScheduleService],
})
export class ClassAdjustmentScheduleModule {}
