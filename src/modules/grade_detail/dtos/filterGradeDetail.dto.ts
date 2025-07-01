import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { EGradeType } from 'src/utils/enums/grade.enum';

export class FilterGradeDetailDto {
  @ApiPropertyOptional({
    description: 'ID của sinh viên',
    example: 101,
  })
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @ApiPropertyOptional({
    description: 'ID của nhóm lớp',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  classGroupId?: number;

  @ApiPropertyOptional({
    description: 'Loại điểm',
    enum: EGradeType,
    example: EGradeType.MIDTERM,
  })
  @IsOptional()
  @IsEnum(EGradeType)
  gradeType?: EGradeType;
}
