import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassAdjustmentScheduleService } from './class_adjustment_schedule.service';
import { ClassAdjustmentScheduleController } from './class_adjustment_schedule.controller';
import { RoomModule } from 'src/modules/room/room.module';
import { ClassGroupModule } from '../class_group/class_group.module';
import { ClassAdjustmentScheduleEntity } from './entities/class_adjustment_schedule.entity';
import { TimeSlotModule } from '../time_slot/time_slot.module';
import { StudentModule } from '../student/student.module';
import { LecturerModule } from '../lecturer/lecturer.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([ClassAdjustmentScheduleEntity]),
    forwardRef(() => ClassGroupModule),
    forwardRef(() => RoomModule),
    forwardRef(() => TimeSlotModule),
    forwardRef(() => StudentModule),
    LecturerModule,
  ],
  controllers: [ClassAdjustmentScheduleController],
  providers: [ClassAdjustmentScheduleService],
  exports: [ClassAdjustmentScheduleService],
})
export class ClassAdjustmentScheduleModule {}
