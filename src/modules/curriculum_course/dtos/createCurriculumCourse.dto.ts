import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsPositive,
  ValidateIf,
} from 'class-validator';

export class CreateCurriculumCourseDto {
  @ApiProperty({
    description: 'ID của Chương trình đào tạo',
    example: 1,
    required: true,
    type: Number,
  })
  @IsPositive({ message: 'ID Chương trình đào tạo phải là số dương' })
  @IsNotEmpty({ message: 'ID Chương trình đào tạo không được để trống' })
  curriculumId: number;

  @ApiProperty({
    description: 'ID của Môn học',
    example: 15,
    required: true,
    type: Number,
  })
  @IsPositive({ message: 'ID Môn học phải là số dương' })
  @IsNotEmpty({ message: 'ID Môn học không được để trống' })
  courseId: number;

  @ApiProperty({
    description: 'Môn học là bắt buộc trong chương trình này?',
    example: true,
    required: true,
    type: Boolean,
  })
  @IsBoolean({ message: 'Trường isMandatory phải là true hoặc false' })
  @IsNotEmpty({ message: 'Trường isMandatory không được để trống' })
  isMandatory: boolean;

  @ApiProperty({
    description: 'ID của Học kỳ gợi ý',
    example: 5,
    required: true,
    type: Number,
  })
  @IsPositive({ message: 'ID Học kỳ phải là số dương' })
  @IsNotEmpty({ message: 'ID Học kỳ không được để trống' })
  semesterId: number;

  @ApiPropertyOptional({
    description: 'Điểm tối thiểu yêu cầu (thang điểm 10)',
    example: 4.0,
    required: false,
    type: Number,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @Min(0, { message: 'Điểm tối thiểu không được âm' })
  @Max(10, { message: 'Điểm tối thiểu không được lớn hơn 10' })
  @IsNumber({}, { message: 'Điểm tối thiểu phải là số' })
  minGradeRequired?: number | null;

  @ApiPropertyOptional({
    description:
      'ID của môn học tiên quyết **cho môn này trong CTĐT này** (nếu có)',
    example: 10,
    required: false,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.prerequisiteCourseId !== null && o.prerequisiteCourseId !== undefined,
  )
  @IsPositive({ message: 'ID môn tiên quyết phải là số dương' })
  prerequisiteCourseId?: number | null;
}
