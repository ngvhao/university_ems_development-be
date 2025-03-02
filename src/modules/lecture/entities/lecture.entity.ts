import { DepartmentEntity } from 'src/modules/department/entities/department.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

@Entity('lecturers')
export class LecturerEntity extends IEntity {
  @Column()
  userId: number;

  @Column()
  departmentId: number;

  @Column({ nullable: true })
  academicRank: string;

  @Column({ nullable: true })
  specialization: string;

  @OneToOne(() => UserEntity, (user) => user.lecturer)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => DepartmentEntity, (department) => department.lecturers)
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;
}
