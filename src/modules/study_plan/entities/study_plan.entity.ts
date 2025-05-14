import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { EStudyPlanStatus } from 'src/utils/enums/study-plan.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('study_plans')
@Index(['studentId', 'semesterId', 'courseId'], { unique: true })
export class StudyPlanEntity extends IEntity {
  @ApiProperty({
    description: 'Trạng thái kế hoạch (0: Đã hủy, 1: Đã lên kế hoạch)',
    enum: EStudyPlanStatus,
    example: EStudyPlanStatus.PLANNED,
    default: EStudyPlanStatus.PLANNED,
  })
  @Column({
    type: 'enum',
    enum: EStudyPlanStatus,
    default: EStudyPlanStatus.PLANNED,
    nullable: false,
  })
  status: EStudyPlanStatus;

  @ApiProperty({
    type: () => StudentEntity,
    description: 'Sinh viên sở hữu kế hoạch',
  })
  @ManyToOne(() => StudentEntity, (student) => student.studyPlans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ApiProperty({ description: 'ID Sinh viên', example: 101 })
  @Column({ nullable: false })
  studentId: number;

  @ApiProperty({
    type: () => SemesterEntity,
    description: 'Học kỳ dự kiến học',
  })
  @ManyToOne(() => SemesterEntity, (semester) => semester.studyPlans, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ApiProperty({ description: 'ID Học kỳ', example: 5 })
  @Column({ nullable: false })
  semesterId: number;

  @ApiProperty({
    type: () => CourseEntity,
    description: 'Môn học trong kế hoạch',
  })
  @ManyToOne(() => CourseEntity, (course) => course.studyPlans, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ApiProperty({ description: 'ID Môn học', example: 15 })
  @Column({ nullable: false })
  courseId: number;
}
