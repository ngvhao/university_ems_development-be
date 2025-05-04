import {
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSemesterDto {
  @ApiProperty({
    description: 'Mã định danh duy nhất của học kỳ',
    example: '2024-HK1',
    maxLength: 20,
  })
  @IsString({ message: 'Mã học kỳ phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã học kỳ là bắt buộc' })
  @MaxLength(20, { message: 'Mã học kỳ không được vượt quá 20 ký tự' })
  semesterCode: string;

  @ApiProperty({
    description: 'Năm bắt đầu của học kỳ',
    example: 2024,
    minimum: 2000,
  })
  @IsInt({ message: 'Năm bắt đầu phải là số nguyên' })
  @Min(2000, { message: 'Năm bắt đầu phải từ 2000 trở lên' })
  @IsNotEmpty({ message: 'Năm bắt đầu là bắt buộc' })
  startYear: number;

  @ApiProperty({
    description: 'Năm kết thúc của học kỳ',
    example: 2024,
    minimum: 2000,
  })
  @IsInt({ message: 'Năm kết thúc phải là số nguyên' })
  @Min(2000, { message: 'Năm kết thúc phải từ 2000 trở lên' })
  @IsNotEmpty({ message: 'Năm kết thúc là bắt buộc' })
  endYear: number;

  @ApiProperty({
    description: 'Kỳ học trong năm (1, 2, hoặc 3)',
    example: 1,
    enum: [1, 2, 3],
  })
  @IsEnum([1, 2, 3], { message: 'Kỳ học phải là 1, 2, hoặc 3' })
  @IsNotEmpty({ message: 'Kỳ học là bắt buộc' })
  term: number;

  @ApiProperty({
    description: 'Ngày bắt đầu học kỳ (định dạng ISO 8601)',
    example: '2024-03-01T00:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là chuỗi ngày ISO hợp lệ' })
  @IsNotEmpty({ message: 'Ngày bắt đầu là bắt buộc' })
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc học kỳ (định dạng ISO 8601)',
    example: '2024-06-30T23:59:59Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Ngày kết thúc phải là chuỗi ngày ISO hợp lệ' })
  @IsNotEmpty({ message: 'Ngày kết thúc là bắt buộc' })
  endDate: Date;
}
