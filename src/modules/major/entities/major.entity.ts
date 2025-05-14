import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { CurriculumEntity } from 'src/modules/curriculum/entities/curriculum.entity';
import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('majors')
export class MajorEntity extends IEntity {
  @ApiProperty({
    description: 'Mã duy nhất của ngành học',
    example: 'KTPM',
    maxLength: 20,
  })
  @Index({ unique: true })
  @Column({ unique: true, length: 20, nullable: false })
  majorCode: string;

  @ApiProperty({
    description: 'Tên Ngành học (duy nhất)',
    example: 'Kỹ thuật phần mềm',
    maxLength: 100,
  })
  @Index({ unique: true })
  @Column({ unique: true, length: 100, nullable: false })
  name: string;

  @ApiProperty({
    type: () => DepartmentEntity,
    description: 'Khoa/Bộ môn quản lý Ngành',
  })
  @ManyToOne(() => DepartmentEntity, (department) => department.majors, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @ApiProperty({ description: 'ID của Khoa/Bộ môn', example: 5 })
  @Column({ nullable: false })
  departmentId: number;

  @ApiPropertyOptional({
    type: () => [StudentEntity],
    description: 'Danh sách sinh viên thuộc Ngành',
  })
  @OneToMany(() => StudentEntity, (student) => student.major)
  students: StudentEntity[];

  @ApiPropertyOptional({
    type: () => [ClassEntity],
    description: 'Danh sách lớp học thuộc Ngành',
  })
  @OneToMany(() => ClassEntity, (classEntity) => classEntity.major)
  classes: ClassEntity[];

  @ApiPropertyOptional({
    type: () => [CurriculumEntity],
    description: 'Danh sách chương trình đào tạo của Ngành',
  })
  @OneToMany(() => CurriculumEntity, (curriculum) => curriculum.major)
  curriculums: CurriculumEntity[];
}
