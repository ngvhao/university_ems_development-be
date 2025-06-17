import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassWeeklyScheduleEntity } from 'src/modules/class_weekly_schedule/entities/class_weekly_schedule.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';
import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('class_groups')
@Index(['courseId', 'groupNumber', 'semesterId'], { unique: true })
export class ClassGroupEntity extends IEntity {
  @ApiProperty({ example: 1, description: 'Số thứ tự của nhóm lớp' })
  @Column({ type: 'int', nullable: false })
  groupNumber: number;

  @ApiProperty({ example: 60, description: 'Số lượng sinh viên tối đa' })
  @Column({ type: 'int', nullable: false })
  maxStudents: number;

  @ApiProperty({
    example: 45,
    description: 'Số lượng sinh viên đã đăng ký chính thức',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  registeredStudents: number;

  @ApiProperty({
    enum: EClassGroupStatus,
    example: EClassGroupStatus.OPEN_FOR_REGISTER,
    description: 'Trạng thái của nhóm lớp',
    default: EClassGroupStatus.OPEN_FOR_REGISTER,
  })
  @Column({
    type: 'enum',
    enum: EClassGroupStatus,
    default: EClassGroupStatus.OPEN_FOR_REGISTER,
    comment:
      'Trạng thái: CLOSED_FOR_REGISTER = 0, OPEN_FOR_REGISTER = 1, LOCKED = 2, CANCELLED = 3, IN_PROGRESS = 4',
  })
  status: EClassGroupStatus;

  @ApiProperty({
    type: () => [EnrollmentCourseEntity],
    description: 'Danh sách các lượt đăng ký vào nhóm lớp này',
  })
  @OneToMany(
    () => EnrollmentCourseEntity,
    (enrollment) => enrollment.classGroup,
  )
  enrollments: EnrollmentCourseEntity[];

  @ApiPropertyOptional({
    example: 25,
    description: 'ID Giảng viên phụ trách (nếu có)',
  })
  @Column({ nullable: true })
  lecturerId?: number;

  @ApiPropertyOptional({
    type: () => LecturerEntity,
    description: 'Giảng viên phụ trách nhóm lớp (nếu có)',
  })
  @ManyToOne(() => LecturerEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lecturerId' })
  lecturer?: LecturerEntity;

  @ApiProperty({ description: 'ID của học kỳ gợi ý', example: 5 })
  @Column({ nullable: false })
  semesterId: number;

  @ApiProperty({
    type: () => SemesterEntity,
    description: 'Học kỳ gợi ý để học môn này',
  })
  @ManyToOne(() => SemesterEntity, (semester) => semester.classGroups, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ManyToOne(() => CourseEntity, (course) => course.classGroups, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ApiProperty({ description: 'ID của môn học', example: 15 })
  @Column({ nullable: false })
  courseId: number;

  @ApiProperty({
    type: () => [ClassWeeklyScheduleEntity],
    description: 'Danh sách các lịch học của nhóm lớp',
  })
  @OneToMany(
    () => ClassWeeklyScheduleEntity,
    (classWeeklySchedule) => classWeeklySchedule.classGroup,
  )
  schedules: ClassWeeklyScheduleEntity[];
}
