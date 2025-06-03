import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateTuitionDto } from './createTuition.dto';

export class UpdateTuitionDto extends PartialType(CreateTuitionDto) {
  @ApiPropertyOptional({
    example: 3000000,
    description:
      'Số tiền còn lại phải đóng (sẽ được tính toán lại nếu totalAmountDue hoặc amountPaid thay đổi)',
    type: 'number',
    format: 'float',
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Số tiền còn lại phải đóng phải là một số với tối đa 2 chữ số thập phân',
    },
  )
  @Min(0, { message: 'Số tiền còn lại không được âm' })
  balance?: number;
}
