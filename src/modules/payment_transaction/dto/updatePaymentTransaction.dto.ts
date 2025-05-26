import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EPaymentTransactionStatus } from '../../../utils/enums/tuition.enum';

export class UpdatePaymentTransactionDto {
  @ApiPropertyOptional({
    enum: EPaymentTransactionStatus,
    example: EPaymentTransactionStatus.SUCCESS,
    description: 'Trạng thái mới của giao dịch thanh toán',
  })
  @IsOptional()
  @IsEnum(EPaymentTransactionStatus, {
    message: 'Trạng thái giao dịch không hợp lệ',
  })
  status?: EPaymentTransactionStatus;

  @ApiPropertyOptional({
    example: 'Cập nhật thông tin giao dịch',
    description: 'Ghi chú cập nhật về giao dịch',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là một chuỗi' })
  notes?: string;
}
