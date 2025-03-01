import { EUserRole, EUserStatus } from 'src/utils/enums/user.enum';
import { IEntity } from 'src/utils/interfaces/IEntity';
import { Column, Entity } from 'typeorm';

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
}
