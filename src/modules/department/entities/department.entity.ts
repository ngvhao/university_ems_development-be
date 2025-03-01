import { FacultyEntity } from 'src/modules/faculty/entities/faculty.entity';
import { LecturerEntity } from 'src/modules/lecture/entities/lecture.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('departments')
export class DepartmentEntity extends IEntity {
  @Column()
  departmentCode: string;

  @Column()
  name: string;

  @Column()
  facultyId: number;

  @ManyToOne(() => FacultyEntity, (faculty) => faculty.departments)
  @JoinColumn({ name: 'facultyId' })
  faculty: FacultyEntity;

  @OneToMany(() => LecturerEntity, (lecturer) => lecturer.department)
  lecturers: LecturerEntity[];

  @OneToMany(() => MajorEntity, (major) => major.department)
  majors: MajorEntity[];
}
