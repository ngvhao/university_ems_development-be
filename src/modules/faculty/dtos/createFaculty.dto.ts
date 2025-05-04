import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({
    description: 'Mã duy nhất của Khoa',
    example: 'CNTT',
    required: true,
    maxLength: 20,
  })
  @IsString({ message: 'Mã Khoa phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã Khoa không được để trống' })
  @MaxLength(20, { message: 'Mã Khoa không được vượt quá 20 ký tự' })
  facultyCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của Khoa',
    example: 'Công nghệ Thông tin',
    required: true,
    maxLength: 255,
  })
  @IsString({ message: 'Tên Khoa phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên Khoa không được để trống' })
  @MaxLength(255, { message: 'Tên Khoa không được vượt quá 255 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả thêm về Khoa (nếu có)',
    example:
      'Khoa đào tạo các ngành thuộc lĩnh vực Công nghệ Thông tin và Truyền thông.',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;
}
