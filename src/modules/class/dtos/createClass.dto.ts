import {
  IsString,
  IsInt,
  IsNotEmpty,
  MaxLength,
  Min,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @IsString({ message: 'Mã lớp phải là một chuỗi' })
  @IsNotEmpty({ message: 'Mã lớp không được để trống' })
  @MaxLength(20, { message: 'Mã lớp không được vượt quá 20 ký tự' })
  @ApiProperty({
    description: 'Mã định danh duy nhất của lớp học',
    example: '25050201',
    required: true,
    maxLength: 20,
  })
  classCode: string;

  @IsInt({ message: 'ID Ngành học phải là một số nguyên' })
  @IsPositive({ message: 'ID Ngành học phải là số dương' })
  @IsNotEmpty({ message: 'ID Ngành học không được để trống' })
  @ApiProperty({
    description: 'ID của Ngành học mà lớp này thuộc về',
    example: 1,
    required: true,
    type: Number,
    minimum: 1,
  })
  majorId: number;

  @IsInt({ message: 'Năm nhập học phải là một số nguyên' })
  @Min(1900, { message: 'Năm nhập học phải lớn hơn hoặc bằng 1900' })
  @IsNotEmpty({ message: 'Năm nhập học không được để trống' })
  @ApiProperty({
    description: 'Năm sinh viên của lớp bắt đầu nhập học',
    example: 2024,
    required: true,
    type: Number,
    minimum: 1900,
  })
  yearOfAdmission: number;

  @IsOptional()
  @IsInt({ message: 'ID Giảng viên chủ nhiệm phải là một số nguyên' })
  @IsPositive({ message: 'ID Giảng viên chủ nhiệm phải là số dương' })
  @ApiProperty({
    description: 'ID của Giảng viên chủ nhiệm lớp (có thể trống)',
    example: 5,
    required: false,
    type: Number,
    minimum: 1,
  })
  homeroomLecturerId?: number;
}
