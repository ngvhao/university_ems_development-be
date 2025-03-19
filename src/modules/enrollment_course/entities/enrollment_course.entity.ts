import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { ECourseStatus } from 'src/utils/enums/course.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity('enrollment_courses')
export class EnrollmentCourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentEntity, { nullable: false })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ManyToOne(() => CourseSemesterEntity, { nullable: false })
  @JoinColumn({ name: 'courseSemesterId' })
  courseSemester: CourseSemesterEntity;

  @Column({ type: 'float', nullable: true })
  grade: number;

  @Column({
    type: 'enum',
    enum: ECourseStatus,
    default: ECourseStatus.ENROLLED,
  })
  status: ECourseStatus;
}
