import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { EDayOfWeek } from 'src/utils/enums/schedule.enum';
import { ApiProperty } from '@nestjs/swagger';
import { TimeSlotEntity } from 'src/modules/time_slot/entities/time_slot.entity';

@Entity('class_weekly_schedules')
@Index(['classGroupId', 'dayOfWeek', 'timeSlotId'], { unique: true })
@Index(['roomId', 'dayOfWeek', 'timeSlotId'], { unique: false })
export class ClassWeeklyScheduleEntity extends IEntity {
  @ApiProperty({
    description: 'Thứ trong tuần',
    enum: EDayOfWeek,
    example: EDayOfWeek.MONDAY,
  })
  @Column({ type: 'enum', enum: EDayOfWeek, nullable: false })
  dayOfWeek: EDayOfWeek;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp học có lịch này',
  })
  @ManyToOne(() => ClassGroupEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @ApiProperty({ example: 10, description: 'ID Nhóm lớp học' })
  @Column({ nullable: false })
  classGroupId: number;

  @ApiProperty({
    type: () => RoomEntity,
    description: 'Phòng học diễn ra tiết học',
  })
  @ManyToOne(() => RoomEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @ApiProperty({ example: 5, description: 'ID Phòng học' })
  @Column({ nullable: false })
  roomId: number;

  @ApiProperty({
    type: () => TimeSlotEntity,
    description: 'Khung giờ diễn ra tiết học',
  })
  @ManyToOne(() => TimeSlotEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlotEntity;

  @ApiProperty({ example: 3, description: 'ID Khung giờ học' })
  @Column({ nullable: false })
  timeSlotId: number;
}
