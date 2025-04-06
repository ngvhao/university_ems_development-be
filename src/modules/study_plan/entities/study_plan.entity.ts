import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';

@Entity('study_plans')
export class StudyPlanEntity extends IEntity {
  @Column()
  status: string;

  @Column({ name: 'plannedDate', type: 'date' })
  plannedDate: Date;

  @ManyToOne(() => StudentEntity, (student) => student.studyPlans)
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ManyToOne(() => SemesterEntity, (semester) => semester.studyPlans)
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ManyToOne(() => CourseEntity, (course) => course.studyPlans)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;
}
