import { Module, forwardRef } from '@nestjs/common';
import { ClassWeeklyScheduleService } from './class_weekly_schedule.service';
import { ClassWeeklyScheduleController } from './class_weekly_schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassWeeklyScheduleEntity } from './entities/class_weekly_schedule.entity';
import { StudentModule } from '../student/student.module';
import { ClassGroupModule } from '../class_group/class_group.module';
import { RoomModule } from '../room/room.module';
import { TimeSlotModule } from '../time_slot/time_slot.module';
import { EnrollmentCourseModule } from '../enrollment_course/enrollment_course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassWeeklyScheduleEntity]),
    StudentModule,
    forwardRef(() => ClassGroupModule),
    forwardRef(() => RoomModule),
    forwardRef(() => TimeSlotModule),
    EnrollmentCourseModule,
  ],
  providers: [ClassWeeklyScheduleService],
  controllers: [ClassWeeklyScheduleController],
  exports: [ClassWeeklyScheduleService],
})
export class ClassWeeklyScheduleModule {}
