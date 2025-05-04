import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { EnrollmentCourseEntity } from 'src/modules/enrollment_course/entities/enrollment_course.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EStudentStatus } from 'src/utils/enums/user.enum';

@Entity('students')
@Index(['studentCode'], { unique: true })
export class StudentEntity extends IEntity {
  @ApiProperty({ description: 'Mã sinh viên duy nhất', example: 'SV00001' })
  @Column({ unique: true })
  studentCode: string;

  @ApiProperty({ description: 'Khóa học (Năm nhập học)', example: 2024 })
  @Column({ type: 'int' })
  academicYear: number;

  @ApiPropertyOptional({
    description: 'Điểm trung bình tích lũy (GPA)',
    example: 3.2,
    default: 0.0,
  })
  @Column({ type: 'float', default: 0.0 })
  gpa: number;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    enum: EStudentStatus,
    default: EStudentStatus.ENROLLED,
  })
  @Column({
    type: 'enum',
    enum: EStudentStatus,
    default: EStudentStatus.ENROLLED,
  })
  status: EStudentStatus;

  @ApiProperty({
    description: 'Ngày nhập học',
    example: '2024-09-05',
    type: String,
    format: 'date',
  })
  @Column({ type: 'date' })
  enrollmentDate: Date;

  @ApiPropertyOptional({
    description: 'Ngày tốt nghiệp dự kiến',
    example: '2028-09-05',
    type: String,
    format: 'date',
  })
  @Column({ type: 'date', nullable: true })
  expectedGraduationDate: Date | null;

  @Index()
  @Column()
  userId: number;

  @ApiProperty({ type: () => UserEntity })
  @OneToOne(() => UserEntity, (user) => user.student, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column()
  majorId: number;

  @ApiProperty({ type: () => MajorEntity })
  @ManyToOne(() => MajorEntity, (major) => major.students, {
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @Index()
  @Column()
  classId: number;

  @ApiProperty({ type: () => ClassEntity })
  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, {
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  @ApiPropertyOptional({ type: () => [StudyPlanEntity] })
  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.student, {
    eager: false,
  })
  studyPlans: StudyPlanEntity[];

  @ApiPropertyOptional({ type: () => [EnrollmentCourseEntity] })
  @OneToMany(() => EnrollmentCourseEntity, (enrollment) => enrollment.student, {
    eager: false,
  })
  enrollments: EnrollmentCourseEntity[];
}
