import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CurriculumEntity } from 'src/modules/curriculum/entities/curriculum.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';

@Entity()
export class CurriculumCourseEntity extends IEntity {
  @Column({ name: 'isMandatory' })
  isMandatory: boolean;

  @Column({ name: 'minGradeRequired' })
  minGradeRequired: number;

  @ManyToOne(
    () => CurriculumEntity,
    (curriculum) => curriculum.curriculumCourses,
  )
  @JoinColumn({ name: 'curriculumId' })
  curriculum: CurriculumEntity;

  @ManyToOne(() => CourseEntity, (course) => course.curriculumCourses)
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ManyToOne(() => SemesterEntity, (semester) => semester.curriculumCourses)
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;
}
