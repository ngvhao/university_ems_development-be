import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EAcademicRank } from 'src/utils/enums/user.enum';
import { LecturerCourseEntity } from 'src/modules/lecturer_course/entities/lecturer_course.entity';

@Entity('lecturers')
export class LecturerEntity extends IEntity {
  @ApiProperty({ description: 'ID của User liên kết', example: 10 })
  @Index({ unique: true })
  @Column({ unique: true, nullable: false })
  userId: number;

  @ApiProperty({ description: 'ID của Khoa/Bộ môn', example: 5 })
  @Column({ nullable: false })
  departmentId: number;

  @ApiPropertyOptional({
    description: 'Học hàm/Học vị',
    example: EAcademicRank.MASTER,
    enum: EAcademicRank,
  })
  @Column({
    nullable: true,
    type: 'enum',
    enum: EAcademicRank,
    comment: 'MASTER = 4, DOCTOR = 1, ASSOCIATE_PROFESSOR = 2, PROFESSOR = 3',
  })
  academicRank: EAcademicRank;

  @ApiPropertyOptional({
    description: 'Chuyên ngành chính',
    example: 'Khoa học Máy tính',
    maxLength: 255,
  })
  @Column({ length: 255, nullable: true })
  specialization: string;

  @ApiProperty({ description: 'Là trưởng bộ môn?', default: false })
  @Column({ default: false, nullable: false })
  isHeadDepartment: boolean;

  @ApiProperty({
    type: () => UserEntity,
    description: 'Thông tin User liên kết',
  })
  @OneToOne(() => UserEntity, (user) => user.lecturer, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ApiProperty({
    type: () => DepartmentEntity,
    description: 'Khoa/Bộ môn trực thuộc',
  })
  @ManyToOne(() => DepartmentEntity, (department) => department.lecturers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @ApiPropertyOptional({
    type: () => [ClassEntity],
    description: 'Các lớp Giảng viên này làm chủ nhiệm',
  })
  @OneToMany(() => ClassEntity, (classEntity) => classEntity.lecturer, {})
  classes: ClassEntity[];

  @ApiPropertyOptional({
    type: () => [LecturerCourseEntity],
    description: 'Các môn Giảng viên này có thể dạy',
  })
  @OneToMany(
    () => LecturerCourseEntity,
    (lecturerCourse) => lecturerCourse.lecturer,
  )
  lecturerCourses: LecturerCourseEntity[];
}
