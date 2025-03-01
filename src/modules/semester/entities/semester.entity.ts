import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';

@Entity('semesters')
export class SemesterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  semesterCode: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'enum', enum: [1, 2, 3] })
  term: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @OneToMany(
    () => CourseSemesterEntity,
    (courseSemester) => courseSemester.semester,
  )
  courseSemesters: CourseSemesterEntity[];
}
