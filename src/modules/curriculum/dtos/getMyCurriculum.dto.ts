import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumberString } from 'class-validator';

export class GetMyCurriculumsQueryDto {
  @ApiProperty({
    name: 'majorId',
    required: false,
    type: Number,
    description: 'ID của ngành học (tùy chọn)',
  })
  @IsOptional()
  @IsNumberString()
  majorId?: number;

  @ApiProperty({
    name: 'yearAdmission',
    required: false,
    type: Number,
    description: 'Năm nhập học hoặc năm của chương trình (tùy chọn)',
  })
  @IsOptional()
  @IsNumberString()
  yearAdmission?: number;
}
