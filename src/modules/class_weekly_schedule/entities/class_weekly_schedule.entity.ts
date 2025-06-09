import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
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
  @Column({
    type: 'enum',
    enum: EDayOfWeek,
    nullable: false,
    comment:
      'MONDAY = 1, TUESDAY = 2, WEDNESDAY = 3, THURSDAY = 4, FRIDAY = 5, SATURDAY = 6, SUNDAY = 7',
  })
  dayOfWeek: EDayOfWeek;

  @ApiProperty({ example: 10, description: 'ID Nhóm lớp học' })
  @Column({ nullable: false })
  classGroupId: number;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp học có lịch này',
  })
  @ManyToOne(() => ClassGroupEntity, (classGroup) => classGroup.schedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

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

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2025-09-01',
    type: String,
    format: 'date',
  })
  @Column({ nullable: false, type: 'date' })
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2026-01-05',
    type: String,
    format: 'date',
  })
  @Column({ nullable: false, type: 'date' })
  endDate: Date;

  @ApiProperty({ example: 25, description: 'ID Giảng viên dạy buổi này' })
  @Column({ nullable: false })
  lecturerId: number;

  @ApiProperty({
    description: 'Các ngày được lên lịch (dạng mảng chuỗi ngày)',
    example: ['2026-01-05', '2026-01-06', '2026-01-07'],
    type: [String],
  })
  @Column({ type: 'text', array: true, nullable: false })
  scheduledDates: string[];
}
