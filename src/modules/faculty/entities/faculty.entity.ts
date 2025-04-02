import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { FacultyRegistrationScheduleEntity } from 'src/modules/faculty_registration_schedule/entities/faculty_registration_schedule.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('faculties')
export class FacultyEntity extends IEntity {
  @Column()
  facultyCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => DepartmentEntity, (department) => department.faculty)
  departments: DepartmentEntity[];

  @OneToMany(
    () => FacultyRegistrationScheduleEntity,
    (schedule) => schedule.faculty,
    { cascade: true },
  )
  registrationSchedules: FacultyRegistrationScheduleEntity[];
}
