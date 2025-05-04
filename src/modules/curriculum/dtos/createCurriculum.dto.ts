import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
export class CreateCurriculumDto {
  @ApiProperty({
    description: 'Tổng số tín chỉ yêu cầu của chương trình đào tạo',
    example: 120,
    required: true,
    type: Number,
    minimum: 0,
  })
  @Min(0, { message: 'Tổng tín chỉ yêu cầu không được âm' })
  @IsInt({ message: 'Tổng tín chỉ yêu cầu phải là số nguyên' })
  @IsNotEmpty({ message: 'Tổng tín chỉ yêu cầu không được để trống' })
  totalCreditsRequired: number;

  @ApiProperty({
    description: 'Số tín chỉ tự chọn yêu cầu trong chương trình',
    example: 15,
    required: true,
    type: Number,
    minimum: 0,
  })
  @Min(0, { message: 'Tín chỉ tự chọn yêu cầu không được âm' })
  @IsInt({ message: 'Tín chỉ tự chọn yêu cầu phải là số nguyên' })
  @IsNotEmpty({ message: 'Tín chỉ tự chọn yêu cầu không được để trống' })
  electiveCreditsRequired: number;

  @ApiProperty({
    description: 'Ngày bắt đầu hiệu lực của chương trình (YYYY-MM-DD)',
    example: '2024-09-01',
    required: true,
    type: String,
    format: 'date',
  })
  @IsDateString({}, { message: 'Ngày hiệu lực phải đúng định dạng YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Ngày hiệu lực không được để trống' })
  effectiveDate: string;

  @ApiPropertyOptional({
    description: 'Ngày hết hiệu lực của chương trình (YYYY-MM-DD, nếu có)',
    example: '2028-08-31',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày hết hiệu lực phải đúng định dạng YYYY-MM-DD' },
  )
  expiryDate?: string | null;

  @ApiProperty({
    description: 'ID của Ngành học mà chương trình này áp dụng',
    example: 3,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Ngành học phải là số dương' })
  @IsNotEmpty({ message: 'ID Ngành học không được để trống' })
  majorId: number;

  @ApiProperty({
    description: 'Năm học bắt đầu áp dụng chương trình (ví dụ: 2024)',
    example: 2024,
    required: true,
    type: Number,
    minimum: 1900,
  })
  @Min(1900, { message: 'Năm học bắt đầu phải hợp lệ' })
  @IsInt({ message: 'Năm học bắt đầu phải là số nguyên' })
  @IsNotEmpty({ message: 'Năm học bắt đầu không được để trống' })
  startAcademicYear: number;

  @ApiProperty({
    description: 'Năm học kết thúc áp dụng chương trình (ví dụ: 2028)',
    example: 2028,
    required: true,
    type: Number,
    minimum: 1900,
  })
  @Min(1900, { message: 'Năm học kết thúc phải hợp lệ' })
  @IsInt({ message: 'Năm học kết thúc phải là số nguyên' })
  @IsNotEmpty({ message: 'Năm học kết thúc không được để trống' })
  endAcademicYear: number;
}
