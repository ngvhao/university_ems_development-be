import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { EGradeType } from 'src/utils/enums/grade.enum';

export class CreateGradeDetailDto {
  @ApiProperty({
    description: 'Loại điểm',
    enum: EGradeType,
    example: EGradeType.ATTENDANCE,
  })
  @IsEnum(EGradeType)
  gradeType: EGradeType;

  @ApiProperty({
    description: 'Điểm số (thang điểm 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @ApiProperty({
    description: 'Trọng số của cột điểm (từ 0-100%)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({
    description: 'Điểm chữ tương ứng',
    example: 'A',
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  letterGrade?: string;

  @ApiPropertyOptional({
    description: 'Ghi chú về điểm',
    example: 'Điểm cộng thêm cho bài tập lớn xuất sắc',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'ID của sinh viên',
    example: 101,
  })
  @IsNumber()
  studentId: number;

  @ApiProperty({
    description: 'ID của nhóm lớp',
    example: 25,
  })
  @IsNumber()
  classGroupId: number;
}
