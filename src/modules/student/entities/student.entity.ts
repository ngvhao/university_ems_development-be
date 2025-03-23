import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';

@Entity('students')
export class StudentEntity extends IEntity {
  @Column({ type: 'int', unsigned: true })
  academicYear: number;

  @Column({ type: 'float', default: 0.0 })
  gpa: number;

  @Column({ type: 'date' })
  enrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedGraduationDate: Date;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => MajorEntity, (major) => major.students, { nullable: false })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.student)
  studyPlans: StudyPlanEntity[];
}
