import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  class_code: string;

  @OneToMany(() => StudentEntity, (student) => student.class)
  students: StudentEntity[];

  @ManyToOne(() => MajorEntity, (major) => major.classes)
  major: MajorEntity;
}
