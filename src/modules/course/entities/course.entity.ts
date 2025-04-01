import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { ECourseType } from 'src/utils/enums/course-type.enum';
import { CourseMajorEntity } from 'src/modules/course-major/entities/course-major.entity';

@Entity('courses')
export class CourseEntity extends IEntity {
  @Column({ unique: true })
  courseCode: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ECourseType,
    nullable: false,
    default: ECourseType.MAJOR_REQUIRED,
  })
  courseType: ECourseType;

  @ManyToOne(() => CourseEntity, { nullable: true })
  @JoinColumn({ name: 'prerequisiteCourseId' })
  prerequisite: CourseEntity;

  @OneToMany(() => CourseSemesterEntity, (cs) => cs.course)
  courseSemesters: CourseSemesterEntity[];

  @OneToMany(
    () => CurriculumCourseEntity,
    (curriculumCourse) => curriculumCourse.course,
  )
  curriculumCourses: CurriculumCourseEntity[];

  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.course)
  studyPlans: StudyPlanEntity[];

  @OneToMany(() => CourseMajorEntity, (courseMajor) => courseMajor.course)
  courseMajors: CourseMajorEntity[];
}
