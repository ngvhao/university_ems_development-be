import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';
import { StudentEntity } from 'src/modules/student/entities/student.entity';
import { EAccountStatus, EUserRole } from 'src/utils/enums/user.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { Column, Entity, OneToOne, Index } from 'typeorm';

@Entity('users')
@Index(['universityEmail'], { unique: true })
// @Index(['personalEmail'], { unique: true })
export class UserEntity extends IEntity {
  @ApiProperty({
    description: 'Email trường cấp (duy nhất)',
    example: 'student001@university.edu',
  })
  @Column({ unique: true })
  universityEmail: string;

  @ApiProperty({
    description: 'Email cá nhân (duy nhất)',
    example: 'personal@example.com',
  })
  @Column()
  personalEmail: string;

  @Column()
  password: string;

  @ApiProperty({ description: 'Tên', example: 'Văn' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'Họ', example: 'Nguyễn' })
  @Column()
  lastName: string;

  @ApiPropertyOptional({
    description: 'URL ảnh đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: 'Vai trò người dùng', enum: EUserRole })
  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0987654321' })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Số CCCD/CMND', example: '012345678912' })
  @Column({ nullable: true })
  identityCardNumber: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh',
    example: '2000-12-31T00:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  @Column({ nullable: true })
  gender: string;

  @ApiPropertyOptional({ description: 'Quê quán', example: 'Hà Nội' })
  @Column({ nullable: true })
  hometown: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ thường trú',
    example: 'Số 1, Đường ABC, ...',
  })
  @Column({ type: 'text', nullable: true })
  permanentAddress: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ tạm trú',
    example: 'Số 2, Đường DEF, ...',
  })
  @Column({ type: 'text', nullable: true })
  temporaryAddress: string;

  @ApiPropertyOptional({ description: 'Quốc tịch', example: 'Việt Nam' })
  @Column({ nullable: true })
  nationality: string;

  @ApiPropertyOptional({ description: 'Dân tộc', example: 'Kinh' })
  @Column({ nullable: true })
  ethnicity: string;

  @ApiPropertyOptional({
    description: 'Cờ đánh dấu tài khoản hoạt động (nên dùng status)',
    default: true,
  })
  @Column({
    type: 'enum',
    enum: EAccountStatus,
    default: EAccountStatus.ACTIVE,
  })
  isActive: EAccountStatus;

  @ApiPropertyOptional({ type: () => StudentEntity })
  @OneToOne(() => StudentEntity, (student) => student.user, {
    nullable: true,
    eager: false,
  })
  student?: StudentEntity;

  @ApiPropertyOptional({ type: () => LecturerEntity })
  @OneToOne(() => LecturerEntity, (lecturer) => lecturer.user, {
    nullable: true,
    eager: false,
  })
  lecturer?: LecturerEntity;
}
