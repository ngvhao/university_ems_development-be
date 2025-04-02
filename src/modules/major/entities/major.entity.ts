import { ClassEntity } from 'src/modules/class/entities/class.entity';
import { CourseMajorEntity } from 'src/modules/course_major/entities/course_major.entity';
import { CurriculumEntity } from 'src/modules/curriculum/entities/curriculum.entity';
import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('majors')
export class MajorEntity extends IEntity {
  @Column({ unique: true })
  name: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.majors)
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @OneToMany(() => StudentEntity, (student) => student.major)
  students: StudentEntity[];

  @OneToMany(() => ClassEntity, (classs) => classs.major)
  classes: ClassEntity[];

  @OneToMany(() => CurriculumEntity, (curriculum) => curriculum.major)
  curriculums: CurriculumEntity[];

  @OneToMany(() => CourseMajorEntity, (courseMajor) => courseMajor.major)
  courseMajors: CourseMajorEntity[];
}
