import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTuitionDetailDto {
  @ApiProperty({ example: 1, description: 'ID của khoản học phí tổng' })
  @IsNotEmpty({ message: 'ID học phí tổng không được để trống' })
  @IsNumber({}, { message: 'ID học phí tổng phải là một số' })
  tuitionId: number;

  @ApiProperty({
    example: 15,
    description: 'ID của bản ghi đăng ký môn học',
  })
  @IsNotEmpty({ message: 'ID đăng ký môn học không được để trống' })
  @IsNumber({}, { message: 'ID đăng ký môn học phải là một số' })
  enrollmentId: number;

  @ApiProperty({
    example: 1500000,
    description: 'Số tiền học phí cho môn học/đăng ký này',
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Số tiền phải là một số với tối đa 2 chữ số thập phân' },
  )
  @Min(0, { message: 'Số tiền không được âm' })
  amount: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Số tín chỉ của môn học (tại thời điểm tính phí)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Số tín chỉ phải là một số nguyên dương nhỏ' })
  @Min(0)
  numberOfCredits?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Đơn giá mỗi tín chỉ (tại thời điểm tính phí)',
    type: 'number',
    format: 'float',
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Đơn giá mỗi tín chỉ phải là một số với tối đa 2 chữ số thập phân',
    },
  )
  @Min(0, { message: 'Đơn giá mỗi tín chỉ không được âm' })
  pricePerCredit?: number;
}
