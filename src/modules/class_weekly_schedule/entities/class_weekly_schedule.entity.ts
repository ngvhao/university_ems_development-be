import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { EDayOfWeek } from 'src/utils/enums/schedule.enum';
import { TimeSlotsEntity } from 'src/modules/time_slots/entities/time_slots.entity';

@Entity('class_weekly_schedules')
@Index(['classGroupId', 'dayOfWeek', 'timeSlotId'], { unique: true })
export class ClassWeeklyScheduleEntity extends IEntity {
  @Column({ type: 'enum', enum: EDayOfWeek })
  dayOfWeek: EDayOfWeek;

  @ManyToOne(() => ClassGroupEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @Column()
  classGroupId: number;

  @ManyToOne(() => RoomEntity, { nullable: false })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @Column()
  roomId: number;

  @ManyToOne(() => TimeSlotsEntity, { nullable: false })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlotsEntity;

  @Column()
  timeSlotId: number;
}
