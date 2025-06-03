import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ETuitionType } from 'src/utils/enums/tuition.enum';

export class CreateTuitionBatchDto {
  @ApiProperty({
    example: 20241,
    description: 'ID của học kỳ (ví dụ: 20241 là học kỳ 1 năm 2024)',
    type: Number,
  })
  @IsNotEmpty({ message: 'ID học kỳ không được để trống' })
  @IsNumber({}, { message: 'ID học kỳ phải là một số' })
  semesterId: number;

  @ApiProperty({
    enum: ETuitionType,
    example: ETuitionType.REGULAR,
    description: 'Loại học phí/đợt thu',
  })
  @IsNotEmpty({ message: 'Loại học phí không được để trống' })
  @IsEnum(ETuitionType, { message: 'Loại học phí không hợp lệ' })
  tuitionType: ETuitionType;

  @ApiProperty({
    example: 'Học phí chính HK1 năm học 2024-2025',
    description: 'Mô tả chi tiết cho khoản học phí/đợt thu',
    type: String,
  })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là một chuỗi ký tự' })
  description: string;

  @ApiProperty({
    example: 500000,
    description: 'Đơn giá cho mỗi tín chỉ trong học kỳ này',
    type: Number,
  })
  @IsNotEmpty({ message: 'Đơn giá tín chỉ không được để trống' })
  @IsNumber({}, { message: 'Đơn giá tín chỉ phải là một số' })
  @Min(0, { message: 'Đơn giá tín chỉ không được âm' })
  pricePerCreditForSemester: number;

  @ApiProperty({
    example: '2025-05-28',
    description: 'Ngày phát hành phiếu thu/học phí (định dạng YYYY-MM-DD)',
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'Ngày phát hành phải là một ngày hợp lệ (YYYY-MM-DD)' },
  )
  issueDate: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Ngày đến hạn thanh toán (định dạng YYYY-MM-DD)',
    type: String,
    format: 'date',
  })
  @IsNotEmpty({ message: 'Ngày đến hạn không được để trống' })
  @IsDateString(
    {},
    { message: 'Ngày đến hạn phải là một ngày hợp lệ (YYYY-MM-DD)' },
  )
  dueDate: string;
}
