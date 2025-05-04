import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { ERegistrationStatus } from 'src/utils/enums/course.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Entity, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';

@Entity('course_semesters')
export class CourseSemesterEntity extends IEntity {
  @ManyToOne(() => CourseEntity, (course) => course.courseSemesters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ManyToOne(() => SemesterEntity, (semester) => semester.courseSemesters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @Column({
    type: 'enum',
    enum: ERegistrationStatus,
    default: ERegistrationStatus.CLOSED,
  })
  registrationStatus: ERegistrationStatus;

  @Column({ type: 'int', default: 0 })
  preRegisteredStudents: number;

  @OneToMany(() => ClassGroupEntity, (classGroup) => classGroup.courseSemester)
  classGroups: ClassGroupEntity[];
}
