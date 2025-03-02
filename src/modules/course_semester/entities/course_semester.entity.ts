import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';

@Entity('course_semesters')
export class CourseSemesterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CourseEntity, { nullable: false })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column({ type: 'int', default: 50 })
  maxStudents: number;

  @Column({ type: 'int', default: 0 })
  currentRegisterd: number;

  @ManyToOne(() => SemesterEntity, { nullable: false })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;
}
