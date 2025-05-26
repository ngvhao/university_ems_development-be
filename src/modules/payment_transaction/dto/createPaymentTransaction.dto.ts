import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EPaymentMethod,
  EPaymentTransactionStatus,
} from '../../../utils/enums/tuition.enum';

export class CreatePaymentTransactionDto {
  @ApiProperty({ example: 1, description: 'ID của khoản học phí tổng' })
  @IsNotEmpty({ message: 'ID học phí không được để trống' })
  @IsNumber({}, { message: 'ID học phí phải là một số' })
  tuitionId: number;

  @ApiProperty({
    example: 2000000,
    description: 'Số tiền đã thanh toán trong giao dịch này',
  })
  @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Số tiền thanh toán phải là số với tối đa 2 chữ số thập phân' },
  )
  @IsPositive({ message: 'Số tiền thanh toán phải là số dương' })
  amountPaid: number;

  @ApiProperty({
    example: '2024-07-15T10:30:00Z',
    description: 'Ngày giờ thực hiện giao dịch',
  })
  @IsNotEmpty({ message: 'Ngày thanh toán không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày thanh toán phải là một ngày hợp lệ' })
  paymentDate: Date;

  @ApiProperty({
    enum: EPaymentMethod,
    example: EPaymentMethod.BANK_TRANSFER,
    description: 'Phương thức thanh toán',
  })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  @IsEnum(EPaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: EPaymentMethod;

  @ApiPropertyOptional({
    enum: EPaymentTransactionStatus,
    example: EPaymentTransactionStatus.SUCCESS,
    description:
      'Trạng thái của giao dịch thanh toán (mặc định là PENDING nếu không cung cấp)',
    default: EPaymentTransactionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(EPaymentTransactionStatus, {
    message: 'Trạng thái giao dịch không hợp lệ',
  })
  status?: EPaymentTransactionStatus = EPaymentTransactionStatus.PENDING;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID của người dùng xử lý giao dịch (nếu có)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID người dùng xử lý phải là một số' })
  processedByUserId?: number;

  @ApiPropertyOptional({
    example: 'Thanh toán lần 1 cho học kỳ 1',
    description: 'Ghi chú thêm về giao dịch',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là một chuỗi' })
  notes?: string;
}
