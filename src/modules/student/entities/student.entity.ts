import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { MajorEntity } from 'src/modules/major/entities/major.entity';
import { ClassEntity } from 'src/modules/class/entities/class.entity';

@Entity('students')
export class StudentEntity extends IEntity {
  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => MajorEntity, (major) => major.students, { nullable: false })
  @JoinColumn({ name: 'major_id' })
  major: MajorEntity;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, {
    nullable: false,
  })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @Column({ type: 'int', unsigned: true })
  academic_year: number;

  @Column({ type: 'float', default: 0.0 })
  gpa: number;
}
