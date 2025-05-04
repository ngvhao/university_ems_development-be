import { FacultyEntity } from 'src/modules/faculty/entities/faculty.entity';
import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('departments')
export class DepartmentEntity extends IEntity {
  @ApiProperty({
    description: 'Mã duy nhất của Bộ môn',
    example: 'CNPM',
    maxLength: 20,
  })
  @Index({ unique: true })
  @Column({ unique: true, length: 20, nullable: false })
  departmentCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của Bộ môn',
    example: 'Công nghệ phần mềm',
    maxLength: 255,
  })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({
    type: () => FacultyEntity,
    description: 'Khoa (Faculty) trực thuộc',
  })
  @ManyToOne(() => FacultyEntity, (faculty) => faculty.departments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;

  @ApiProperty({ description: 'ID của Khoa (Faculty) trực thuộc', example: 1 })
  @Column({ nullable: false })
  facultyId: number;

  @ApiPropertyOptional({
    type: () => [LecturerEntity],
    description: 'Danh sách giảng viên thuộc Khoa/Bộ môn',
  })
  @OneToMany(() => LecturerEntity, (lecturer) => lecturer.department)
  lecturers: LecturerEntity[];

  @ApiPropertyOptional({
    type: () => [MajorEntity],
    description: 'Danh sách ngành học thuộc Khoa/Bộ môn',
  })
  @OneToMany(() => MajorEntity, (major) => major.department)
  majors: MajorEntity[];
}
