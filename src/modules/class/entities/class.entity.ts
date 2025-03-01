import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

@Entity('classes')
export class ClassEntity extends IEntity {
  @Column({ unique: true })
  classCode: string;

  @OneToMany(() => StudentEntity, (student) => student.class)
  students: StudentEntity[];

  @ManyToOne(() => MajorEntity, (major) => major.classes)
  major: MajorEntity;
}
