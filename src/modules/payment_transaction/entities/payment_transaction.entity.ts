import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import {
  EPaymentMethod,
  EPaymentTransactionStatus,
} from '../../../utils/enums/tuition.enum';
import { TuitionEntity } from 'src/modules/tuition/entities/tuition.entity';
import { IEntity } from 'src/utils/interfaces/entity.interface';

@Entity({ name: 'payment_transactions' })
export class PaymentTransactionEntity extends IEntity {
  @ApiProperty({ example: 1, description: 'ID của khoản học phí tổng' })
  @Column()
  tuitionId: number;

  @ManyToOne(
    () => TuitionEntity,
    (tuitionFee) => tuitionFee.paymentTransactions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'tuitionId' })
  tuition: TuitionEntity;

  @ApiProperty({
    example: 2000000,
    description: 'Số tiền đã thanh toán trong giao dịch này',
    type: 'number',
    format: 'float',
  })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountPaid: number;

  @ApiProperty({
    example: '2024-07-15T10:30:00Z',
    description: 'Ngày giờ thực hiện giao dịch',
  })
  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @ApiProperty({
    enum: EPaymentMethod,
    example: EPaymentMethod.BANK_TRANSFER,
    description: 'Phương thức thanh toán',
  })
  @Column({
    type: 'enum',
    enum: EPaymentMethod,
    comment:
      'BANK_TRANSFER = 0, CASH = 1, CREDIT_CARD = 2, ONLINE_GATEWAY = 3, POS = 4',
  })
  paymentMethod: EPaymentMethod;

  @ApiProperty({
    enum: EPaymentTransactionStatus,
    example: EPaymentTransactionStatus.SUCCESS,
    description: 'Trạng thái của giao dịch thanh toán',
  })
  @Column({
    type: 'enum',
    enum: EPaymentTransactionStatus,
    default: EPaymentTransactionStatus.PENDING,
    comment:
      'PENDING = 0, SUCCESS = 1, FAILED = 2, REFUNDED = 3, PROCESSING = 4',
  })
  status: EPaymentTransactionStatus;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID của người dùng xử lý giao dịch (nếu có)',
  })
  @Column({ nullable: true })
  processedByUserId?: number;

  @ApiPropertyOptional({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processedByUserId' })
  processedByUser?: UserEntity;

  @ApiPropertyOptional({
    example: 'Thanh toán lần 1 cho học kỳ 1',
    description: 'Ghi chú thêm về giao dịch',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;
}
