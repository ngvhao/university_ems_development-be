import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { ECourseType } from 'src/utils/enums/course-type.enum';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Mã duy nhất của môn học',
    example: 'IT101',
    required: true,
    maxLength: 20,
  })
  @IsString({ message: 'Mã môn học phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã môn học không được để trống' })
  @MaxLength(20, { message: 'Mã môn học không được vượt quá 20 ký tự' })
  courseCode: string;

  @ApiProperty({
    description: 'Tên đầy đủ của môn học',
    example: 'Nhập môn Công nghệ Thông tin',
    required: true,
    maxLength: 255,
  })
  @IsString({ message: 'Tên môn học phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên môn học không được để trống' })
  @MaxLength(255, { message: 'Tên môn học không được vượt quá 255 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Số tín chỉ của môn học',
    example: 3,
    required: true,
    type: Number,
    minimum: 0,
  })
  @Min(0, { message: 'Số tín chỉ không được âm' })
  @IsInt({ message: 'Số tín chỉ phải là số nguyên' })
  @IsNotEmpty({ message: 'Số tín chỉ không được để trống' })
  credit: number;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về môn học',
    example: 'Cung cấp kiến thức cơ bản về ngành CNTT.',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'Loại môn học (Bắt buộc chung, Bắt buộc ngành, Tự chọn, ...)',
    enum: ECourseType,
    example: ECourseType.MAJOR_REQUIRED,
    required: true,
    default: ECourseType.MAJOR_REQUIRED,
  })
  @IsEnum(ECourseType, { message: 'Loại môn học không hợp lệ' })
  @IsNotEmpty({ message: 'Loại môn học không được để trống' })
  courseType: ECourseType;

  @ApiPropertyOptional({
    description: 'ID của môn học',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'ID của khoa phải là số' })
  facultyId: number;
}
