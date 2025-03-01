import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { CourseEntity } from 'src/modules/course/entities/course.entity';
import { FacultyEntity } from 'src/modules/falcuty/entities/falcuty.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('majors')
export class MajorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => FacultyEntity, (faculty) => faculty.majors, {
    nullable: false,
  })
  @JoinColumn({ name: 'faculty_id' })
  faculty: FacultyEntity;

  @OneToMany(() => StudentEntity, (student) => student.major)
  students: StudentEntity[];

  @OneToMany(() => ClassEntity, (classs) => classs.major)
  classes: ClassEntity[];

  @OneToMany(() => CourseEntity, (course) => course.major)
  courses: CourseEntity[];
}
