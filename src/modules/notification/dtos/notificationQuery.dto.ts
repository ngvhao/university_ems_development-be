import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ENotificationStatus,
  ENotificationType,
  ENotificationPriority,
  EAudienceType,
} from 'src/utils/enums/notification.enum';

export class NotificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tiêu đề hoặc nội dung' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    enum: ENotificationStatus,
  })
  @IsOptional()
  @IsEnum(ENotificationStatus)
  status?: ENotificationStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo loại thông báo',
    enum: ENotificationType,
  })
  @IsOptional()
  @IsEnum(ENotificationType)
  notificationType?: ENotificationType;

  @ApiPropertyOptional({
    description: 'Lọc theo mức độ ưu tiên',
    enum: ENotificationPriority,
  })
  @IsOptional()
  @IsEnum(ENotificationPriority)
  priority?: ENotificationPriority;

  @ApiPropertyOptional({ description: 'Lọc theo ID học kỳ' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  semesterId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo loại đối tượng' })
  @IsOptional()
  @IsEnum(EAudienceType)
  audienceType?: EAudienceType;

  @ApiPropertyOptional({ description: 'Lọc theo giá trị đối tượng' })
  @IsOptional()
  @IsString()
  audienceValue?: string;

  @ApiPropertyOptional({ description: 'Lọc theo ID người tạo' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  createdByUserId?: number;
}
