import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { ECourseType } from 'src/utils/enums/course-type.enum';
import { CourseMajorEntity } from 'src/modules/course_major/entities/course_major.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @OneToMany(() => CourseSemesterEntity, (cs) => cs.course)
  courseSemesters: CourseSemesterEntity[];

  @OneToMany(() => CurriculumCourseEntity, (cc) => cc.course)
  curriculumCourses: CurriculumCourseEntity[];

  @OneToMany(() => StudyPlanEntity, (sp) => sp.course)
  studyPlans: StudyPlanEntity[];

  @OneToMany(() => CourseMajorEntity, (cm) => cm.course)
  courseMajors: CourseMajorEntity[];
}
