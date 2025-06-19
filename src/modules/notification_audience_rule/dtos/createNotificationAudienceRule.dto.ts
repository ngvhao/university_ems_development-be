import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  EAudienceType,
  EConditionLogic,
} from 'src/utils/enums/notification.enum';

export class CreateNotificationAudienceRuleDto {
  @ApiProperty({
    description: 'Loại đối tượng nhận thông báo',
    enum: EAudienceType,
    example: EAudienceType.ROLE,
  })
  @IsNotEmpty({ message: 'Loại đối tượng không được để trống' })
  @IsEnum(EAudienceType, { message: 'Loại đối tượng không hợp lệ' })
  audienceType: EAudienceType;

  @ApiProperty({
    description:
      'Giá trị của đối tượng (ví dụ: ID vai trò, ID ngành, danh sách user ID cách nhau bởi dấu phẩy)',
    example: 'STUDENT_ROLE_ID hoặc 1,2,3',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Giá trị đối tượng phải là chuỗi' })
  @MaxLength(500, { message: 'Giá trị đối tượng quá dài' })
  audienceValue?: string | null;

  @ApiProperty({
    description: 'Logic điều kiện (INCLUDE hoặc EXCLUDE)',
    enum: EConditionLogic,
    default: EConditionLogic.INCLUDE,
    example: EConditionLogic.INCLUDE,
  })
  @IsNotEmpty({ message: 'Logic điều kiện không được để trống' })
  @IsEnum(EConditionLogic, { message: 'Logic điều kiện không hợp lệ' })
  conditionLogic: EConditionLogic = EConditionLogic.INCLUDE;
}
