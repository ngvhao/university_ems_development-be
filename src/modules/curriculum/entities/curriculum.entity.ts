import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('curriculums')
@Index(['majorId', 'startAcademicYear', 'endAcademicYear'])
export class CurriculumEntity extends IEntity {
  @ApiProperty({ description: 'Tổng tín chỉ yêu cầu', example: 120 })
  @Column({ name: 'totalCreditsRequired', type: 'int', nullable: false })
  totalCreditsRequired: number;

  @ApiProperty({ description: 'Tín chỉ tự chọn yêu cầu', example: 15 })
  @Column({ name: 'electiveCreditsRequired', type: 'int', nullable: false })
  electiveCreditsRequired: number;

  @ApiProperty({ description: 'Ngày bắt đầu hiệu lực', example: '2024-09-01' })
  @Column({ name: 'effectiveDate', type: 'date', nullable: false })
  effectiveDate: Date;

  @ApiPropertyOptional({
    description: 'Ngày hết hiệu lực (nếu có)',
    example: '2028-08-31',
  })
  @Column({ name: 'expiryDate', type: 'date', nullable: true })
  expiryDate: Date | null;

  @ApiProperty({ description: 'Năm học bắt đầu', example: 2024 })
  @Column({ nullable: false })
  startAcademicYear: number;

  @ApiProperty({ description: 'Năm học kết thúc', example: 2028 })
  @Column({ nullable: false })
  endAcademicYear: number;

  @ApiProperty({
    type: () => MajorEntity,
    description: 'Ngành học áp dụng chương trình',
  })
  @ManyToOne(() => MajorEntity, (major) => major.curriculums, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @ApiProperty({ description: 'ID của Ngành học', example: 3 })
  @Column({ nullable: false })
  majorId: number;

  @ApiPropertyOptional({
    type: () => [CurriculumCourseEntity],
    description: 'Danh sách các môn học trong chương trình này',
  })
  @OneToMany(() => CurriculumCourseEntity, (course) => course.curriculum, {
    cascade: ['insert', 'update'],
  })
  curriculumCourses: CurriculumCourseEntity[];
}
