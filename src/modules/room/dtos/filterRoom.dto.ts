import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRoomDto {
  @ApiPropertyOptional({
    description: 'Lọc theo loại phòng',
    example: 'CLASSROOM',
  })
  @IsOptional()
  @IsString()
  roomType?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo sức chứa tối thiểu',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
