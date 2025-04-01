import { Entity, Column, OneToMany } from 'typeorm';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';

@Entity('semesters')
export class SemesterEntity extends IEntity {
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
