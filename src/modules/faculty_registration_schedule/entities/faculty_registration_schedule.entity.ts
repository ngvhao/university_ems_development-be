// src/faculty-registration-schedule/faculty-registration-schedule.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { FacultyEntity } from 'src/modules/faculty/entities/faculty.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';
import { IEntity } from 'src/utils/interfaces/IEntity';

@Entity('faculty_registration_schedules')
export class FacultyRegistrationScheduleEntity extends IEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facultyId: number;

  @ManyToOne(() => FacultyEntity, (faculty) => faculty.registrationSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;

  @Column()
  semesterId: number;

  @ManyToOne(
    () => SemesterEntity,
    (semester) => semester.registrationSchedules,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  preRegistrationStartDate: Date;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  preRegistrationEndDate: Date;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  registrationStartDate: Date;

  @Column({ type: 'timestamp' })
  @Type(() => Date)
  registrationEndDate: Date;

  @Column({
    type: 'enum',
    enum: EFacultyRegistrationScheduleStatus,
    default: EFacultyRegistrationScheduleStatus.PENDING,
  })
  status: EFacultyRegistrationScheduleStatus;
}
