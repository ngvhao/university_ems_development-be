import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity('enrollments')
export class EnrollmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentEntity, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @ManyToOne(() => CourseSemesterEntity, { nullable: false })
  @JoinColumn({ name: 'course_semester_id' })
  courseSemester: CourseSemesterEntity;

  @Column({ type: 'float', nullable: true })
  grade: number;

  @Column({
    type: 'enum',
    enum: ['ENROLLED', 'PASSED', 'FAILED', 'WITHDRAWN'],
    default: 'ENROLLED',
  })
  status: string;
}
