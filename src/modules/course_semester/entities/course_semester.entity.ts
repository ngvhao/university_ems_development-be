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
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ type: 'int', default: 50 })
  maxStudents: number;

  @ManyToOne(() => SemesterEntity, { nullable: false })
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;
}
