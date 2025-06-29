import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateCourseFacultyDto {
  @ApiProperty({
    description: 'ID của môn học',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'ID môn học phải là số nguyên' })
  @Min(1, { message: 'ID môn học phải lớn hơn 0' })
  @IsNotEmpty({ message: 'ID môn học không được để trống' })
  courseId: number;

  @ApiProperty({
    description: 'ID của khoa',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'ID khoa phải là số nguyên' })
  @Min(1, { message: 'ID khoa phải lớn hơn 0' })
  @IsNotEmpty({ message: 'ID khoa không được để trống' })
  facultyId: number;

  @ApiPropertyOptional({
    description: 'Mô tả về mối quan hệ giữa môn học và khoa',
    example: 'Môn học này được giảng dạy bởi khoa CNTT',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Có phải môn học chính của khoa hay không',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrimary phải là boolean' })
  isPrimary?: boolean;
}
