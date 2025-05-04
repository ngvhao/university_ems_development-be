import { ApiProperty } from '@nestjs/swagger';
import { CourseSemesterEntity } from 'src/modules/course_semester/entities/course_semester.entity';
import { CurriculumCourseEntity } from 'src/modules/curriculum_course/entities/curriculum_course.entity';
import { FacultyRegistrationScheduleEntity } from 'src/modules/faculty_registration_schedule/entities/faculty_registration_schedule.entity';
import { StudyPlanEntity } from 'src/modules/study_plan/entities/study_plan.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('semesters')
export class SemesterEntity extends IEntity {
  @ApiProperty({ description: 'Mã học kỳ', example: '2024-HK1', maxLength: 20 })
  @Column({ unique: true, length: 20 })
  semesterCode: string;

  @ApiProperty({ description: 'Năm bắt đầu', example: 2024 })
  @Column()
  startYear: number;

  @ApiProperty({ description: 'Năm kết thúc', example: 2024 })
  @Column()
  endYear: number;

  @ApiProperty({ description: 'Kỳ học trong năm', example: 1, enum: [1, 2, 3] })
  @Column({ type: 'smallint' })
  term: number;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2024-03-01T00:00:00Z' })
  @Column({ type: 'timestamp with time zone' })
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-06-30T23:59:59Z',
  })
  @Column({ type: 'timestamp with time zone' })
  endDate: Date;

  @ApiProperty({
    type: () => [CourseSemesterEntity],
    required: false,
    description: 'Các khóa học được mở trong học kỳ này',
  })
  @OneToMany(
    () => CourseSemesterEntity,
    (courseSemester) => courseSemester.semester,
  )
  courseSemesters: CourseSemesterEntity[];

  @ApiProperty({
    type: () => [FacultyRegistrationScheduleEntity],
    required: false,
    description: 'Lịch đăng ký tín chỉ của học kỳ này',
  })
  @OneToMany(
    () => FacultyRegistrationScheduleEntity,
    (registrationSchedule) => registrationSchedule.semester,
  )
  registrationSchedules: FacultyRegistrationScheduleEntity[];

  @ApiProperty({
    type: () => [StudyPlanEntity],
    required: false,
    description: 'Các kế hoạch học tập liên quan đến học kỳ này',
  })
  @OneToMany(() => StudyPlanEntity, (studyPlan) => studyPlan.semester)
  studyPlans: StudyPlanEntity[];

  @ApiProperty({
    type: () => [CurriculumCourseEntity],
    required: false,
    description: 'Các môn học trong chương trình đào tạo thuộc học kỳ này',
  })
  @OneToMany(
    () => CurriculumCourseEntity,
    (curriculumCourse) => curriculumCourse.semester,
  )
  curriculumCourses: CurriculumCourseEntity[];
}
