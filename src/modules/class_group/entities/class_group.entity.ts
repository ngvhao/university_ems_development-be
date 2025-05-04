import { ApiProperty } from '@nestjs/swagger';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { IEntity } from 'src/utils/interfaces/IEntity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('class_groups')
@Index(['courseSemesterId', 'groupNumber'], { unique: true })
export class ClassGroupEntity extends IEntity {
  @ApiProperty({ example: 1, description: 'Số thứ tự của nhóm lớp' })
  @Column({ type: 'int', nullable: false })
  groupNumber: number;

  @ApiProperty({ example: 60, description: 'Số lượng sinh viên tối đa' })
  @Column({ type: 'int', nullable: false })
  maxStudents: number;

  @ApiProperty({
    example: 5,
    description: 'Số lượng sinh viên đăng ký tạm/ưu tiên (nếu có)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  preRegisteredStudents: number;

  @ApiProperty({
    example: 45,
    description: 'Số lượng sinh viên đã đăng ký chính thức',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  registeredStudents: number;

  @ApiProperty({
    enum: EClassGroupStatus,
    example: EClassGroupStatus.OPEN,
    description: 'Trạng thái của nhóm lớp',
    default: EClassGroupStatus.OPEN,
  })
  @Column({
    type: 'enum',
    enum: EClassGroupStatus,
    default: EClassGroupStatus.OPEN,
  })
  status: EClassGroupStatus;

  @ApiProperty({
    type: () => CourseSemesterEntity,
    description: 'Học phần - học kỳ mà nhóm lớp thuộc về',
  })
  @ManyToOne(
    () => CourseSemesterEntity,
    (courseSemester) => courseSemester.classGroups,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'courseSemesterId' })
  courseSemester: CourseSemesterEntity;

  @ApiProperty({ example: 15, description: 'ID của học phần - học kỳ' })
  @Column({ nullable: false })
  courseSemesterId: number;

  @ApiProperty({
    type: () => [EnrollmentCourseEntity],
    description: 'Danh sách các lượt đăng ký vào nhóm lớp này',
  })
  @OneToMany(
    () => EnrollmentCourseEntity,
    (enrollment) => enrollment.classGroup,
  )
  enrollments: EnrollmentCourseEntity[];
}
