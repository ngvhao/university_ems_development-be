import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';

@Entity('curriculums')
export class CurriculumEntity extends IEntity {
  @Column({ name: 'totalCreditsRequired' })
  totalCreditsRequired: number;

  @Column({ name: 'electiveCreditsRequired' })
  electiveCreditsRequired: number;

  @Column({ name: 'effectiveDate', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'expiryDate', type: 'date', nullable: true })
  expiryDate: Date;

  @ManyToOne(() => MajorEntity, (major) => major.curriculums)
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @Column()
  startAcademicYear: number;

  @Column()
  endAcademicYear: number;

  @OneToMany(() => CurriculumCourseEntity, (course) => course.curriculum)
  curriculumCourses: CurriculumCourseEntity[];
}
