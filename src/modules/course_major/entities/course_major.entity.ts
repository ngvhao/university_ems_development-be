import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('course_major')
@Index(['courseId', 'majorId'], { unique: true })
export class CourseMajorEntity extends IEntity {
  @ApiProperty({
    description: 'Môn học là bắt buộc cho ngành này?',
    default: true,
  })
  @Column({ type: 'boolean', default: true, nullable: false })
  isMandatory: boolean;

  @ApiProperty({
    type: () => CourseEntity,
    description: 'Môn học được liên kết',
  })
  @ManyToOne(() => CourseEntity, (course) => course.courseMajors, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ApiProperty({ description: 'ID của môn học', example: 12 })
  @Column({ nullable: false })
  courseId: number;

  @ApiProperty({
    type: () => MajorEntity,
    description: 'Ngành học được liên kết',
  })
  @ManyToOne(() => MajorEntity, (major) => major.courseMajors, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @ApiProperty({ description: 'ID của ngành học', example: 5 })
  @Column({ nullable: false })
  majorId: number;
}
