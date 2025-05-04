import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Type } from 'class-transformer';
import { FacultyEntity } from 'src/modules/faculty/entities/faculty.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity('faculty_registration_schedules')
@Index(['facultyId', 'semesterId'], { unique: true })
export class FacultyRegistrationScheduleEntity extends IEntity {
  @ApiProperty({ type: () => FacultyEntity, description: 'Khoa áp dụng lịch' })
  @ManyToOne(() => FacultyEntity, (faculty) => faculty.registrationSchedules, {
    onDelete: 'CASCADE',

    nullable: false,
  })
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;

  @ApiProperty({ description: 'ID của Khoa', example: 1 })
  @Column({ nullable: false })
  facultyId: number;

  @ApiProperty({
    type: () => SemesterEntity,
    description: 'Học kỳ áp dụng lịch',
  })
  @ManyToOne(
    () => SemesterEntity,
    (semester) => semester.registrationSchedules,
    {
      onDelete: 'CASCADE',

      nullable: false,
    },
  )
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ApiProperty({ description: 'ID của Học kỳ', example: 5 })
  @Column({ nullable: false })
  semesterId: number;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu ĐK nguyện vọng',
    example: '2024-08-01T08:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  @Type(() => Date)
  preRegistrationStartDate: Date;

  @ApiProperty({
    description: 'Ngày giờ kết thúc ĐK nguyện vọng',
    example: '2024-08-10T17:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  @Type(() => Date)
  preRegistrationEndDate: Date;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu ĐK chính thức',
    example: '2024-08-15T08:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  @Type(() => Date)
  registrationStartDate: Date;

  @ApiProperty({
    description: 'Ngày giờ kết thúc ĐK chính thức',
    example: '2024-08-25T17:00:00Z',
  })
  @Column({ type: 'timestamptz', nullable: false })
  @Type(() => Date)
  registrationEndDate: Date;

  @ApiProperty({
    description: 'Trạng thái của lịch',
    enum: EFacultyRegistrationScheduleStatus,
    default: EFacultyRegistrationScheduleStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: EFacultyRegistrationScheduleStatus,
    default: EFacultyRegistrationScheduleStatus.PENDING,
    nullable: false,
  })
  status: EFacultyRegistrationScheduleStatus;
}
