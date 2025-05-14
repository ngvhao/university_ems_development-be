import { Entity, Column, OneToMany } from 'typeorm';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ECourseType } from 'src/utils/enums/course-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LecturerCourseEntity } from 'src/modules/lecturer_course/entities/lecturer_course.entity';
import { ClassGroupEntity } from 'src/modules/class_group/entities/class_group.entity';

@Entity('courses')
export class CourseEntity extends IEntity {
  @ApiProperty({
    description: 'Mã duy nhất của môn học',
    example: 'IT101',
    maxLength: 20,
  })
  @Column({ unique: true, length: 20, nullable: false })
  courseCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của môn học',
    example: 'Nhập môn Công nghệ Thông tin',
    maxLength: 255,
  })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({ description: 'Số tín chỉ', example: 3, minimum: 0 })
  @Column({ type: 'int', nullable: false })
  credit: number;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết',
    example: 'Cung cấp kiến thức cơ bản về ngành CNTT.',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Loại môn học',
    enum: ECourseType,
    default: ECourseType.MAJOR_REQUIRED,
  })
  @Column({
    type: 'enum',
    enum: ECourseType,
    nullable: false,
    default: ECourseType.MAJOR_REQUIRED,
  })
  courseType: ECourseType;

  @OneToMany(() => CurriculumCourseEntity, (cc) => cc.course)
  curriculumCourses: CurriculumCourseEntity[];

  @OneToMany(() => StudyPlanEntity, (sp) => sp.course)
  studyPlans: StudyPlanEntity[];

  @ApiPropertyOptional({
    type: () => [LecturerCourseEntity],
    description: 'Các giảng viên có thể dạy môn này',
  })
  @OneToMany(
    () => LecturerCourseEntity,
    (lecturerCourse) => lecturerCourse.course,
  )
  lecturerCourses: LecturerCourseEntity[];

  @OneToMany(() => ClassGroupEntity, (classGroup) => classGroup.course)
  classGroups: ClassGroupEntity[];
}
