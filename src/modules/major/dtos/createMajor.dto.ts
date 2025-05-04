import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsPositive } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty({
    description: 'Mã duy nhất của ngành học',
    example: 'KTPM',
    required: true,
    maxLength: 20,
  })
  @IsString({ message: 'Mã ngành học phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã ngành học không được để trống' })
  @MaxLength(20, { message: 'Mã ngành học không được vượt quá 20 ký tự' })
  majorCode: string;

  @ApiProperty({
    description: 'Tên ngành học (phải là duy nhất)',
    example: 'Kỹ thuật phần mềm',
    required: true,
    maxLength: 100,
  })
  @IsString({ message: 'Tên ngành học phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên ngành học không được để trống' })
  @MaxLength(100, { message: 'Tên ngành học không được vượt quá 100 ký tự' })
  name: string;

  @ApiProperty({
    description: 'ID của Bộ môn quản lý ngành học',
    example: 1,
    required: true,
    type: Number,
  })
  @IsPositive({ message: 'ID Bộ môn phải là số dương' })
  @IsNotEmpty({ message: 'ID Bộ môn không được để trống' })
  departmentId: number;
}
