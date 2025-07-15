import { ApiProperty } from '@nestjs/swagger';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { TimeSlotEntity } from 'src/modules/time_slot/entities/time_slot.entity';
import {
  EAdjustmentType,
  EClassAdjustmentScheduleStatus,
} from 'src/utils/enums/class.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('class_adjustment_schedules')
export class ClassAdjustmentScheduleEntity extends IEntity {
  @ApiProperty({
    example: '2025-05-12',
    description: 'Ngày học được điều chỉnh sang',
  })
  @Column({ type: 'timestamp with time zone' })
  adjustmentDate: string;

  @ApiProperty({
    description: 'Ghi chú lý do điều chỉnh (nếu có)',
    example: 'Phòng cũ có sự kiện',
  })
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ApiProperty({
    description: 'Loại điều chỉnh (1: học bù, 2: nghỉ học)',
    example: 1,
  })
  @Column({ type: 'enum', enum: EAdjustmentType })
  type: EAdjustmentType;

  @ApiProperty({
    description:
      'Trạng thái điều chỉnh (1: yêu cầu, 2: phê duyệt, 3: từ chối, 4: hủy)',
    example: 1,
  })
  @Column({
    type: 'enum',
    enum: EClassAdjustmentScheduleStatus,
    default: EClassAdjustmentScheduleStatus.REQUESTED,
    comment:
      'Trạng thái điều chỉnh: REQUESTED = 1, APPROVED = 2, REJECTED = 3, CANCELLED = 4',
  })
  status: EClassAdjustmentScheduleStatus;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp học được điều chỉnh',
  })
  @ManyToOne(() => ClassGroupEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @ApiProperty({ example: 1, description: 'ID của Nhóm lớp học' })
  @Column({ nullable: false })
  classGroupId: number;

  @ApiProperty({
    type: () => RoomEntity,
    description: 'Phòng học được điều chỉnh tới',
  })
  @ManyToOne(() => RoomEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @ApiProperty({ example: 3, description: 'ID của Phòng học' })
  @Column({ nullable: true })
  roomId?: number;

  @ApiProperty({
    type: () => TimeSlotEntity,
    description: 'Khung giờ học được điều chỉnh tới',
  })
  @ManyToOne(() => TimeSlotEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlotEntity;

  @ApiProperty({ example: 2, description: 'ID của Khung giờ học' })
  @Column({ nullable: true })
  timeSlotId?: number;
}
