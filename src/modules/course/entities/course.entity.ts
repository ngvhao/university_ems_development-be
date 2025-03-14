import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  courseCode: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CourseEntity, { nullable: true })
  @JoinColumn({ name: 'prerequisiteCourseId' })
  prerequisite: CourseEntity;

  @ManyToOne(() => MajorEntity, (major) => major.courses, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @OneToMany(() => CourseSemesterEntity, (cs) => cs.course)
  courseSemesters: CourseSemesterEntity[];
}
