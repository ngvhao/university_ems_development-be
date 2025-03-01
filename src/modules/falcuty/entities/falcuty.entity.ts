import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('faculties')
export class FacultyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => MajorEntity, (major) => major.faculty)
  majors: MajorEntity[];
}
