import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { FacultyRegistrationScheduleEntity } from 'src/modules/faculty_registration_schedule/entities/faculty_registration_schedule.entity';
import { CourseFacultyEntity } from 'src/modules/course_faculty/entities/course_faculty.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('faculties')
export class FacultyEntity extends IEntity {
  @ApiProperty({
    description: 'Mã duy nhất của Khoa',
    example: 'CNTT',
    maxLength: 20,
  })
  @Index({ unique: true })
  @Column({ unique: true, length: 20, nullable: false })
  facultyCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của Khoa',
    example: 'Công nghệ Thông tin',
    maxLength: 255,
  })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả thêm về Khoa' })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({
    type: () => [DepartmentEntity],
    description: 'Danh sách Khoa/Bộ môn trực thuộc',
  })
  @OneToMany(() => DepartmentEntity, (department) => department.faculty, {})
  departments: DepartmentEntity[];

  @ApiPropertyOptional({
    type: () => [FacultyRegistrationScheduleEntity],
    description: 'Lịch đăng ký của Khoa',
  })
  @OneToMany(
    () => FacultyRegistrationScheduleEntity,
    (schedule) => schedule.faculty,
    { cascade: true },
  )
  registrationSchedules: FacultyRegistrationScheduleEntity[];

  @ApiPropertyOptional({
    type: () => [CourseFacultyEntity],
    description: 'Các môn học liên quan đến khoa này',
  })
  @OneToMany(
    () => CourseFacultyEntity,
    (courseFaculty) => courseFaculty.faculty,
  )
  courseFaculties: CourseFacultyEntity[];
}
