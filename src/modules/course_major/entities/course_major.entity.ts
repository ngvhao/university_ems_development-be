import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CourseEntity } from 'src/modules/course/entities/course.entity'; // Điều chỉnh đường dẫn nếu cần
import { MajorEntity } from 'src/modules/major/entities/major.entity'; // Điều chỉnh đường dẫn nếu cần
import { IEntity } from 'src/utils/interfaces/IEntity'; // Giả định bạn có base entity này

@Entity('course_major')
export class CourseMajorEntity extends IEntity {
  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @ManyToOne(() => CourseEntity, (course) => course.courseMajors, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @Column()
  courseId: number;

  @ManyToOne(() => MajorEntity, (major) => major.courseMajors, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;
}
