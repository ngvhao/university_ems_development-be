import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('classes')
export class ClassEntity extends IEntity {
  @Column({ unique: true })
  classCode: string;

  @Column({ nullable: false })
  className: string;

  @OneToMany(() => StudentEntity, (student) => student.class)
  students: StudentEntity[];

  @ManyToOne(() => MajorEntity, (major) => major.classes)
  major: MajorEntity;

  @Column({ nullable: false })
  yearOfAdmission: number;

  @ManyToOne(() => LecturerEntity, (lecturer) => lecturer.classes)
  @JoinColumn({ name: 'homeroomLecturerId' })
  lecturer: LecturerEntity;
}
