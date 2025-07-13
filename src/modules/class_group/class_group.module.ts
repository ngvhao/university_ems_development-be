import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassGroupService } from './class_group.service';
import { ClassGroupController } from './class_group.controller';
import { ClassGroupEntity } from './entities/class_group.entity';
import { StudyPlanModule } from '../study_plan/study_plan.module';
import { SemesterModule } from '../semester/semester.module';
import { TimeSlotModule } from '../time_slot/time_slot.module';
import { LecturerModule } from '../lecturer/lecturer.module';
import { RoomModule } from '../room/room.module';
import { SettingModule } from '../setting/setting.module';
import { ClassWeeklyScheduleModule } from '../class_weekly_schedule/class_weekly_schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassGroupEntity]),
    forwardRef(() => StudyPlanModule),
    SemesterModule,
    TimeSlotModule,
    LecturerModule,
    RoomModule,
    SettingModule,
    forwardRef(() => ClassWeeklyScheduleModule),
  ],
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
  exports: [ClassGroupService],
})
export class ClassGroupModule {}
