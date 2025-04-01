import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

@Entity('enrollment_courses')
@Index(['studentId', 'classGroupId'], { unique: true })
export class EnrollmentCourseEntity extends IEntity {
  @Column({
    type: 'enum',
    enum: EEnrollmentStatus,
    default: EEnrollmentStatus.ENROLLED,
  })
  status: EEnrollmentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  enrollmentDate: Date;

  @ManyToOne(() => StudentEntity, (student) => student.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column()
  studentId: number;

  @ManyToOne(() => ClassGroupEntity, (classGroup) => classGroup.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @Column()
  classGroupId: number;
}
