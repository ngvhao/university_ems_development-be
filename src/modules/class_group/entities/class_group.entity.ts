import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';

@Entity('class_groups')
@Index(['courseSemesterId', 'groupNumber'], { unique: true })
export class ClassGroupEntity extends IEntity {
  @Column({ type: 'int' })
  groupNumber: number;

  @Column({ type: 'int' })
  maxStudents: number;

  @Column({ type: 'int', default: 0 })
  preRegisteredStudents: number;

  @Column({ type: 'int', default: 0 })
  registeredStudents: number;

  @Column({
    type: 'enum',
    enum: EClassGroupStatus,
    default: EClassGroupStatus.OPEN,
  })
  status: EClassGroupStatus;

  @ManyToOne(
    () => CourseSemesterEntity,
    (courseSemester) => courseSemester.classGroups,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'courseSemesterId' })
  courseSemester: CourseSemesterEntity;

  @Column()
  courseSemesterId: number;

  @OneToMany(
    () => EnrollmentCourseEntity,
    (enrollment) => enrollment.classGroup,
  )
  enrollments: EnrollmentCourseEntity[];
}
