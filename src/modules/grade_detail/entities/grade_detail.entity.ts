import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';
import { EGradeType } from 'src/utils/enums/grade.enum';

@Entity('grade_details')
@Index(['studentId', 'classGroupId', 'gradeType'], { unique: true })
export class GradeDetailEntity extends IEntity {
  @ApiProperty({
    description: 'Loại điểm',
    enum: EGradeType,
    example: EGradeType.ATTENDANCE,
  })
  @Column({
    type: 'enum',
    enum: EGradeType,
    nullable: false,
    comment: `ATTENDANCE = 1, ASSIGNMENT = 2, QUIZ = 3, MIDTERM = 4, FINAL = 5, PRACTICAL = 6, ORAL = 7, PROJECT = 8, LABORATORY = 9, PRESENTATION = 10, PARTICIPATION = 11, BONUS = 12`,
  })
  gradeType: EGradeType;

  @ApiProperty({
    description: 'Điểm số (thang điểm 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @Column({ type: 'float', nullable: false })
  score: number;

  @ApiProperty({
    description: 'Trọng số của cột điểm (từ 0-100%)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @Column({ type: 'float', nullable: false })
  weight: number;

  @ApiPropertyOptional({
    description: 'Điểm chữ tương ứng',
    example: 'A',
    maxLength: 2,
  })
  @Column({ type: 'varchar', length: 2, nullable: true })
  letterGrade: string | null;

  @ApiPropertyOptional({
    description: 'Ghi chú về điểm',
    example: 'Điểm cộng thêm cho bài tập lớn xuất sắc',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'ID của sinh viên',
    example: 101,
  })
  @Column({ nullable: false })
  studentId: number;

  @ApiProperty({
    type: () => StudentEntity,
    description: 'Sinh viên',
  })
  @ManyToOne(() => StudentEntity, (student) => student.gradeDetails, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ApiProperty({
    description: 'ID của nhóm lớp',
    example: 25,
  })
  @Column({ nullable: false })
  classGroupId: number;

  @ApiProperty({
    type: () => ClassGroupEntity,
    description: 'Nhóm lớp',
  })
  @ManyToOne(() => ClassGroupEntity, (classGroup) => classGroup.gradeDetails, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classGroupId' })
  classGroup: ClassGroupEntity;
}
