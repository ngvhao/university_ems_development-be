import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EPaymentTransactionStatus } from '../../../utils/enums/tuition.enum';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({
    example: '2024-07-15T10:30:00Z',
    description: 'Ngày giờ thực hiện giao dịch',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Ngày thanh toán không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày thanh toán phải là một ngày hợp lệ' })
  paymentDate?: Date;

  @ApiPropertyOptional({
    description: 'Mã trạng thái không thành công',
  })
  @IsOptional()
  @IsString()
  failStatus?: string;

  @ApiPropertyOptional({
    description: 'Mã giao dịch từ cổng thanh toán',
  })
  @IsOptional()
  @IsString()
  transId?: string;
}
