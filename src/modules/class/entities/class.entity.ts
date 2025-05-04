import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
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
import { ApiProperty } from '@nestjs/swagger';

@Entity('classes')
export class ClassEntity extends IEntity {
  @ApiProperty({
    description: 'Mã định danh duy nhất của lớp học',
    example: 'CNTT2024A',
  })
  @Index({ unique: true })
  @Column({ unique: true, length: 20 })
  classCode: string;

  @ApiProperty({
    description: 'Năm sinh viên của lớp bắt đầu nhập học',
    example: 2024,
  })
  @Column({ nullable: false })
  yearOfAdmission: number;

  @ApiProperty({
    type: () => MajorEntity,
    description: 'Ngành học mà lớp thuộc về',
  })
  @ManyToOne(() => MajorEntity, (major) => major.classes, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false,
  })
  @JoinColumn({ name: 'majorId' })
  major: MajorEntity;

  @ApiProperty({ description: 'ID của Ngành học', example: 1 })
  @Column({ nullable: false })
  majorId: number;

  @ApiProperty({
    type: () => LecturerEntity,
    nullable: true,
    description: 'Giảng viên chủ nhiệm lớp (có thể null)',
  })
  @ManyToOne(() => LecturerEntity, (lecturer) => lecturer.classes, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'homeroomLecturerId' })
  lecturer: LecturerEntity;

  @ApiProperty({
    description: 'ID của Giảng viên chủ nhiệm (có thể null)',
    example: 5,
    nullable: true,
  })
  @Column({ nullable: true })
  homeroomLecturerId: number | null;

  @ApiProperty({
    type: () => [StudentEntity],
    description: 'Danh sách sinh viên thuộc lớp',
  })
  @OneToMany(() => StudentEntity, (student) => student.class, {
    eager: false,
  })
  students: StudentEntity[];
}
