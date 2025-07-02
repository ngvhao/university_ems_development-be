import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNotificationAudienceRuleDto } from 'src/modules/notification_audience_rule/dtos/createNotificationAudienceRule.dto';
import {
  ENotificationType,
  ENotificationPriority,
  EAudienceType,
  EConditionLogic,
} from 'src/utils/enums/notification.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Thông báo lịch thi học kỳ 1',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Chi tiết lịch thi xem tại...',
  })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content: string;

  @ApiPropertyOptional({
    description: 'Loại thông báo',
    enum: ENotificationType,
    example: ENotificationType.EXAM,
  })
  @IsOptional()
  @IsEnum(ENotificationType, { message: 'Loại thông báo không hợp lệ' })
  notificationType?: ENotificationType;

  @ApiPropertyOptional({
    description: 'Mức độ ưu tiên',
    enum: ENotificationPriority,
    default: ENotificationPriority.MEDIUM,
    example: ENotificationPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(ENotificationPriority, { message: 'Mức độ ưu tiên không hợp lệ' })
  priority?: ENotificationPriority = ENotificationPriority.MEDIUM;

  @ApiPropertyOptional({ description: 'ID học kỳ (nếu có)', example: 1 })
  @IsOptional()
  @IsInt({ message: 'ID học kỳ phải là số nguyên' })
  semesterId?: number | null;
  @ApiPropertyOptional({
    description: 'Danh sách đính kèm (mảng các URL hoặc tên tệp)',
    type: [String],
    example: ['https://example.com/file1.pdf', 'https://example.com/file2.pdf'],
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách đính kèm phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi phần tử phải là chuỗi' })
  attachments: string[];

  @ApiProperty({
    description: 'Danh sách các quy tắc đối tượng nhận thông báo',
    type: [CreateNotificationAudienceRuleDto],
    example: [
      {
        audienceType: EAudienceType.ROLE,
        audienceValue: 'STUDENT_ROLE_ID',
        conditionLogic: EConditionLogic.INCLUDE,
      },
      {
        audienceType: EAudienceType.MAJOR,
        audienceValue: 'CNTT_MAJOR_ID',
        conditionLogic: EConditionLogic.INCLUDE,
      },
    ],
  })
  @IsArray({ message: 'Danh sách quy tắc đối tượng phải là một mảng' })
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Phải có ít nhất một quy tắc đối tượng' })
  @ArrayMaxSize(10, { message: 'Không được vượt quá 10 quy tắc đối tượng' })
  @Type(() => CreateNotificationAudienceRuleDto)
  audienceRules: CreateNotificationAudienceRuleDto[];
}
