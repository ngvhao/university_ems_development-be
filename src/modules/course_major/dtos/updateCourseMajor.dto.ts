import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
export class UpdateCourseMajorDto {
  @ApiPropertyOptional({
    description: 'Cập nhật trạng thái bắt buộc của môn học cho ngành học',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trường isMandatory phải là true hoặc false' })
  isMandatory?: boolean;
}
