import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsPositive } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Mã duy nhất của Bộ môn',
    example: 'CNPM',
    required: true,
    maxLength: 20,
  })
  @IsString({ message: 'Mã Bộ môn phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã Bộ môn không được để trống' })
  @MaxLength(20, { message: 'Mã Bộ môn không được vượt quá 20 ký tự' })
  departmentCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của Bộ môn',
    example: 'Công nghệ phần mềm',
    required: true,
    maxLength: 255,
  })
  @IsString({ message: 'Tên Bộ môn phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên Bộ môn không được để trống' })
  @MaxLength(255, { message: 'Tên Bộ môn không được vượt quá 255 ký tự' })
  name: string;

  @ApiProperty({
    description: 'ID của Khoa (Faculty) mà bộ môn này trực thuộc',
    example: 1,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Khoa (Faculty) phải là số dương' })
  @IsNotEmpty({ message: 'ID Khoa (Faculty) không được để trống' })
  facultyId: number;
}
