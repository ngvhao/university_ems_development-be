import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { RoomEntity } from 'src/modules/room/entities/room.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { EExamType } from 'src/utils/enums/exam.enum';

@Entity('exam_schedules')
@Index(['classGroupId', 'examType'], { unique: true })
export class ExamScheduleEntity extends IEntity {
  @ApiProperty({
    description: 'Loại kỳ thi',
    enum: EExamType,
    example: EExamType.MIDTERM,
  })
  @Column({
    type: 'enum',
    enum: EExamType,
    nullable: false,
  })
  examType: EExamType;

  @ApiProperty({
    description: 'Ngày thi',
    example: '2024-12-15',
    type: String,
    format: 'date',
  })
  @Column({ type: 'timestamp with time zone', nullable: false })
  examDate: Date;

  @ApiProperty({
    description: 'Giờ bắt đầu thi',
    example: '08:00',
    type: String,
  })
  @Column({ type: 'time with time zone', nullable: false })
  startTime: string;

  @ApiProperty({
    description: 'Giờ kết thúc thi',
    example: '10:00',
    type: String,
  })
  @Column({ type: 'time with time zone', nullable: false })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Ghi chú về kỳ thi',
    example: 'Thi tại phòng A101, mang theo CMND',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'ID của nhóm lớp',
    example: 25,
  })
  @Column({ nullable: false })
  classGroupId: number;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp thi',
  })
  @ManyToOne(() => ClassGroupEntity, (classGroup) => classGroup.examSchedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @ApiProperty({
    description: 'ID của phòng thi',
    example: 10,
  })
  @Column({ nullable: false })
  roomId: number;

  @ApiProperty({
    type: () => RoomEntity,
    description: 'Phòng thi',
  })
  @ManyToOne(() => RoomEntity, (room) => room.examSchedules, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @ApiProperty({
    description: 'ID của học kỳ',
    example: 5,
  })
  @Column({ nullable: false })
  semesterId: number;

  @ApiProperty({
    type: () => SemesterEntity,
    description: 'Học kỳ',
  })
  @ManyToOne(() => SemesterEntity, (semester) => semester.examSchedules, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;
}
