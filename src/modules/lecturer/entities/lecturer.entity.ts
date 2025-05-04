// src/modules/lecturer/entities/lecturer.entity.ts
import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
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
    example: 'ThS',
    maxLength: 50,
  })
  @Column({ nullable: true, enum: EAcademicRank })
  academicRank: EAcademicRank | null;

  @ApiPropertyOptional({
    description: 'Chuyên ngành chính',
    example: 'Khoa học Máy tính',
    maxLength: 255,
  })
  @Column({ length: 255, nullable: true })
  specialization: string | null;

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
}
