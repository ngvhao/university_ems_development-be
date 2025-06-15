import { Entity, Column, Index, OneToMany } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty } from '@nestjs/swagger';
import { ClassWeeklyScheduleEntity } from 'src/modules/class_weekly_schedule/entities/class_weekly_schedule.entity';
import { ClassAdjustmentScheduleEntity } from 'src/modules/class_adjustment_schedule/entities/class_adjustment_schedule.entity';

@Entity('time_slots')
@Index(['startTime', 'endTime'], { unique: true })
export class TimeSlotEntity extends IEntity {
  @ApiProperty({
    description: 'Thời gian bắt đầu (HH:MM:SS)',
    example: '07:00:00',
  })
  @Column({ type: 'time with time zone', nullable: true })
  startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc (HH:MM:SS)',
    example: '09:30:00',
  })
  @Column({ type: 'time with time zone', nullable: true })
  endTime: string;

  @ApiProperty({ description: 'Tiết học/Ca học', example: 1 })
  @Column({ type: 'int', nullable: false })
  shift: number;

  @OneToMany(() => ClassWeeklyScheduleEntity, (schedule) => schedule.timeSlot)
  classWeeklySchedules: ClassWeeklyScheduleEntity[];

  @OneToMany(
    () => ClassAdjustmentScheduleEntity,
    (schedule) => schedule.timeSlot,
  )
  classAdjustmentSchedules: ClassAdjustmentScheduleEntity[];
}
