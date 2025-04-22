// src/modules/student/entities/student.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Type } from 'class-transformer';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';

@Entity('students')
export class StudentEntity extends IEntity {
  @Column({ type: 'int', unsigned: true })
  academicYear: number;

  @Column({ type: 'float', default: 0.0 })
  gpa: number;

  @Column({ type: 'date' })
  @Type(() => Date)
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  @Type(() => Date)
  expectedGraduationDate: Date | null;

  @Index()
  @Column()
  userId: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column()
  majorId: number;

  @ManyToOne(() => MajorEntity, (major) => major.students, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @Index()
  @Column()
  classId: number;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.student)
  studyPlans: StudyPlanEntity[];

  @OneToMany(() => EnrollmentCourseEntity, (enrollment) => enrollment.student)
  enrollments: EnrollmentCourseEntity[];
}
