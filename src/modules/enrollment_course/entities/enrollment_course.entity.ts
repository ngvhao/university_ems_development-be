// src/modules/enrollment_course/entities/enrollment_course.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('enrollment_courses')
@Index(['studentId', 'classGroupId'], {
  unique: true,
  where: `"status" = '${EEnrollmentStatus.ENROLLED}'`,
})
export class EnrollmentCourseEntity extends IEntity {
  @ApiProperty({
    description: 'Trạng thái đăng ký',
    enum: EEnrollmentStatus,
    default: EEnrollmentStatus.ENROLLED,
  })
  @Column({
    type: 'enum',
    enum: EEnrollmentStatus,
    default: EEnrollmentStatus.ENROLLED,
    nullable: false,
    comment:
      'Trạng thái: ENROLLED = 0, PASSED = 1, FAILED = 2, WITHDRAWN = 3, CANCELLED = 4,',
  })
  status: EEnrollmentStatus;

  @ApiProperty({ description: 'Ngày giờ đăng ký' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  enrollmentDate: Date;

  @ApiProperty({ type: () => StudentEntity, description: 'Sinh viên đăng ký' })
  @ManyToOne(() => StudentEntity, (student) => student.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ApiProperty({ description: 'ID của sinh viên', example: 101 })
  @Column({ nullable: false })
  studentId: number;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp được đăng ký',
  })
  @ManyToOne(() => ClassGroupEntity, (classGroup) => classGroup.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;

  @ApiProperty({ description: 'ID của nhóm lớp', example: 25 })
  @Column({ nullable: false })
  classGroupId: number;
}
