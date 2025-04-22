import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { EAdjustmentType } from 'src/utils/enums/schedule.enum';
import { TimeSlotsEntity } from 'src/modules/time_slots/entities/time_slots.entity';

@Entity('class_adjustment_schedules')
@Index(['classGroupId', 'adjustmentDate'], { unique: true })
export class ClassAdjustmentScheduleEntity extends IEntity {
  @Column({ type: 'date' })
  adjustmentDate: string;

  @Column({
    type: 'enum',
    enum: EAdjustmentType,
  })
  adjustmentType: EAdjustmentType;

  @ManyToOne(() => ClassGroupEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @Column()
  classGroupId: number;

  @ManyToOne(() => RoomEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'roomId' })
  room?: RoomEntity;

  @Column({ nullable: true })
  roomId?: number;

  @ManyToOne(() => TimeSlotsEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot?: TimeSlotsEntity;

  @Column({ nullable: true })
  timeSlotId?: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
