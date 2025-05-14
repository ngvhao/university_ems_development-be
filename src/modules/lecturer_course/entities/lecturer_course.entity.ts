import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IEntity } from 'src/utils/interfaces/entity.interface';

@Entity('lecturer_courses')
@Unique(['lecturerId', 'courseId'])
export class LecturerCourseEntity extends IEntity {
  @ApiProperty({ description: 'ID duy nhất của bản ghi phân công', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID của Giảng viên được phân công', example: 1 })
  @Column()
  lecturerId: number;

  @ApiProperty({ description: 'ID của Học phần được phân công', example: 101 })
  @Column()
  courseId: number;

  @ApiProperty({ type: () => LecturerEntity })
  @ManyToOne(() => LecturerEntity, (lecturer) => lecturer.lecturerCourses, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'lecturerId' })
  lecturer: LecturerEntity;

  @ApiProperty({ type: () => CourseEntity })
  @ManyToOne(() => CourseEntity, (course) => course.lecturerCourses, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'courseId' })
  course: CourseEntity;
}
