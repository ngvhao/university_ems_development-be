import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { FacultyEntity } from 'src/modules/faculty/entities/faculty.entity';

@Entity('course_faculties')
@Unique(['courseId', 'facultyId'])
export class CourseFacultyEntity extends IEntity {
  @ApiProperty({
    description: 'ID của môn học',
    example: 1,
  })
  @Column({ type: 'int', nullable: false })
  courseId: number;

  @ApiProperty({
    description: 'ID của khoa',
    example: 1,
  })
  @Column({ type: 'int', nullable: false })
  facultyId: number;

  @ApiPropertyOptional({
    description: 'Mô tả về mối quan hệ giữa môn học và khoa',
    example: 'Môn học này được giảng dạy bởi khoa CNTT',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Trạng thái môn học', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: () => CourseEntity,
    description: 'Thông tin môn học',
  })
  @ManyToOne(() => CourseEntity, (course) => course.courseFaculties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;

  @ApiProperty({
    type: () => FacultyEntity,
    description: 'Thông tin khoa',
  })
  @ManyToOne(() => FacultyEntity, (faculty) => faculty.courseFaculties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;
}
