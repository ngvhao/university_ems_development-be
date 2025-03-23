import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';

@Entity('semesters')
export class SemesterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  semesterCode: string;

  @Column({ type: 'int' })
  startYear: number;

  @Column({ type: 'int' })
  endYear: number;

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

  @OneToMany(
    () => CurriculumCourseEntity,
    (curriculumCourse) => curriculumCourse.semester,
  )
  curriculumCourses: CurriculumCourseEntity[];

  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.semester)
  studyPlans: StudyPlanEntity[];
}
