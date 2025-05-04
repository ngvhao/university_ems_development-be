import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CurriculumEntity } from 'src/modules/curriculum/entities/curriculum.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { SemesterEntity } from 'src/modules/semester/entities/semester.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('curriculum_courses')
@Index(['curriculumId', 'courseId'], { unique: true })
export class CurriculumCourseEntity extends IEntity {
  @ApiProperty({
    description: 'Môn học là bắt buộc trong chương trình này?',
    example: true,
  })
  @Column({ name: 'isMandatory', type: 'boolean', nullable: false })
  isMandatory: boolean;

  @ApiPropertyOptional({
    description: 'Điểm tối thiểu yêu cầu để đạt môn này (thang 10 hoặc 4)',
    example: 4.0,
    type: Number,
  })
  @Column({
    name: 'minGradeRequired',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  minGradeRequired: number | null;

  @ApiProperty({
    type: () => CurriculumEntity,
    description: 'Chương trình đào tạo chứa môn học này',
  })
  @ManyToOne(
    () => CurriculumEntity,
    (curriculum) => curriculum.curriculumCourses,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'curriculumId' })
  curriculum: CurriculumEntity;

  @ApiProperty({ description: 'ID của chương trình đào tạo', example: 1 })
  @Column({ nullable: false })
  curriculumId: number;

  @ApiProperty({
    type: () => CourseEntity,
    description: 'Môn học thuộc chương trình đào tạo',
  })
  @ManyToOne(() => CourseEntity, (course) => course.curriculumCourses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ApiProperty({ description: 'ID của môn học', example: 15 })
  @Column({ nullable: false })
  courseId: number;

  @ApiProperty({
    type: () => SemesterEntity,
    description: 'Học kỳ gợi ý để học môn này',
  })
  @ManyToOne(() => SemesterEntity, (semester) => semester.curriculumCourses, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ApiProperty({ description: 'ID của học kỳ gợi ý', example: 5 })
  @Column({ nullable: false })
  semesterId: number;

  @ApiPropertyOptional({
    type: () => CourseEntity,
    description: 'Môn học tiên quyết **cho môn này trong CTĐT này** (nếu có)',
  })
  @ManyToOne(() => CourseEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'prerequisiteCourseId' })
  prerequisiteCourse: CourseEntity | null;

  @ApiPropertyOptional({
    description: 'ID của môn học tiên quyết **cho môn này trong CTĐT này**',
    example: 10,
    nullable: true,
  })
  @Column({ nullable: true })
  prerequisiteCourseId: number | null;
}
