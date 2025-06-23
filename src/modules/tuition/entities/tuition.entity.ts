import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { StudentEntity } from '../../student/entities/student.entity';
import { SemesterEntity } from '../../semester/entities/semester.entity';
import { ETuitionStatus, ETuitionType } from 'src/utils/enums/tuition.enum';
import { IEntity } from 'src/utils/interfaces/entity.interface';
import { TuitionDetailEntity } from 'src/modules/tuition_detail/entities/tuition_detail.entity';
import { PaymentTransactionEntity } from 'src/modules/payment_transaction/entities/payment_transaction.entity';

@Entity({ name: 'tuitions' })
export class TuitionEntity extends IEntity {
  @ApiProperty({ example: 101, description: 'ID của sinh viên' })
  @Column()
  studentId: number;

  @ManyToOne(() => StudentEntity, (student) => student.tuitions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @ApiProperty({ example: 2, description: 'ID của học kỳ' })
  @Column()
  semesterId: number;

  @ManyToOne(() => SemesterEntity, (semester) => semester.tuitions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: SemesterEntity;

  @ApiProperty({
    enum: ETuitionType,
    example: ETuitionType.REGULAR,
    description: 'Loại học phí/đợt thu',
  })
  @Column({
    type: 'enum',
    enum: ETuitionType,
    default: ETuitionType.REGULAR,
  })
  tuitionType: ETuitionType;

  @ApiProperty({
    example: 'Học phí chính HK1 năm học 2024-2025',
    description: 'Mô tả chi tiết cho khoản học phí/đợt thu',
  })
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ApiProperty({
    example: '2024-08-01',
    description: 'Ngày phát hành/tạo phiếu thu này',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'timestamp with time zone' })
  issueDate: Date;

  @ApiProperty({
    example: 5000000,
    description: 'Tổng số tiền phải đóng (tính từ chi tiết)',
    type: 'number',
    format: 'float',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmountDue: number;

  @ApiProperty({
    example: 2000000,
    description: 'Tổng số tiền đã thanh toán',
    type: 'number',
    format: 'float',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @ApiProperty({
    example: 3000000,
    description: 'Số tiền còn lại phải đóng (totalAmountDue - amountPaid)',
    type: 'number',
    format: 'float',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({
    enum: ETuitionStatus,
    example: ETuitionStatus.PENDING,
    description: 'Trạng thái của khoản học phí',
  })
  @Column({
    type: 'enum',
    enum: ETuitionStatus,
    default: ETuitionStatus.PENDING,
    comment:
      'PENDING = 0, PAID = 1, PARTIALLY_PAID = 2, OVERDUE = 3, CANCELLED = 4',
  })
  status: ETuitionStatus;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Ngày đến hạn thanh toán',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'timestamp with time zone' })
  dueDate: Date;

  @ApiPropertyOptional({
    example: 'Ghi chú thêm về khoản học phí',
    description: 'Ghi chú (nếu có)',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(
    () => TuitionDetailEntity,
    (tuitionDetail) => tuitionDetail.tuition,
  )
  details: TuitionDetailEntity[];

  @OneToMany(
    () => PaymentTransactionEntity,
    (paymentTransaction) => paymentTransaction.tuition,
  )
  paymentTransactions: PaymentTransactionEntity[];
}
