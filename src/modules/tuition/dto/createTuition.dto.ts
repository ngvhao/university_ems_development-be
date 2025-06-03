import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ETuitionStatus } from 'src/utils/enums/tuition.enum';

export class CreateTuitionDto {
  @ApiProperty({ example: 101, description: 'ID của sinh viên' })
  @IsNotEmpty({ message: 'ID sinh viên không được để trống' })
  @IsNumber({}, { message: 'ID sinh viên phải là một số' })
  studentId: number;

  @ApiProperty({ example: 2, description: 'ID của học kỳ' })
  @IsNotEmpty({ message: 'ID học kỳ không được để trống' })
  @IsNumber({}, { message: 'ID học kỳ phải là một số' })
  semesterId: number;

  @ApiProperty({
    example: 5000000,
    description: 'Tổng số tiền phải đóng',
    type: 'number',
    format: 'float',
  })
  @IsNotEmpty({ message: 'Tổng số tiền phải đóng không được để trống' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Tổng số tiền phải đóng phải là một số với tối đa 2 chữ số thập phân',
    },
  )
  @Min(0, { message: 'Tổng số tiền phải đóng không được âm' })
  totalAmountDue: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Tổng số tiền đã thanh toán (mặc định là 0)',
    type: 'number',
    format: 'float',
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Tổng số tiền đã thanh toán phải là một số với tối đa 2 chữ số thập phân',
    },
  )
  @Min(0, { message: 'Tổng số tiền đã thanh toán không được âm' })
  amountPaid?: number;

  @ApiPropertyOptional({
    enum: ETuitionStatus,
    example: ETuitionStatus.PENDING,
    description: 'Trạng thái của khoản học phí (mặc định là PENDING)',
    default: ETuitionStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ETuitionStatus, { message: 'Trạng thái học phí không hợp lệ' })
  status?: ETuitionStatus;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Ngày đến hạn thanh toán',
    type: 'string',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Ngày đến hạn không được để trống' })
  @IsDateString(
    {},
    { message: 'Ngày đến hạn phải là một ngày hợp lệ (YYYY-MM-DD)' },
  )
  dueDate: Date;

  @ApiPropertyOptional({
    example: 'Ghi chú thêm về khoản học phí',
    description: 'Ghi chú (nếu có)',
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là một chuỗi' })
  notes?: string;
}
