import { LecturerEntity } from 'src/modules/lecture/entities/lecture.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { EUserRole, EUserStatus } from 'src/utils/enums/user.enum';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends IEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  userCode: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @Column({ type: 'enum', enum: EUserStatus, default: EUserStatus.ACTIVE })
  status: EUserStatus;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  identityCardNumber: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  hometown: string;

  @Column({ nullable: true })
  permanentAddress: string;

  @Column({ nullable: true })
  temporaryAddress: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  ethnicity: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StudentEntity, (student) => student.user)
  students: StudentEntity[];

  @OneToMany(() => LecturerEntity, (lecturer) => lecturer.user)
  lecturers: LecturerEntity[];
}
