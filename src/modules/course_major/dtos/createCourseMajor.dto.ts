import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsPositive } from 'class-validator';

export class CreateCourseMajorDto {
  @ApiProperty({
    description: 'ID của Môn học cần liên kết',
    example: 12,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Môn học phải là số dương' })
  @IsNotEmpty({ message: 'ID Môn học không được để trống' })
  courseId: number;

  @ApiProperty({
    description: 'ID của Ngành học cần liên kết',
    example: 5,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Ngành học phải là số dương' })
  @IsNotEmpty({ message: 'ID Ngành học không được để trống' })
  majorId: number;

  @ApiPropertyOptional({
    description:
      'Đánh dấu môn học này là bắt buộc cho ngành học này? (Mặc định: true)',
    example: true,
    required: false,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trường isMandatory phải là true hoặc false' })
  isMandatory?: boolean = true;
}
