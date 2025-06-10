import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @class CreateSettingDto
 * @description DTO để tạo một cài đặt mới.
 */
export class CreateSettingDto {
  /**
   * @property {string} key - Khóa duy nhất của cài đặt.
   * @example 'current_semester'
   */
  @ApiProperty({
    description:
      'Khóa duy nhất của cài đặt (ví dụ: current_semester, system_maintenance_mode)',
    example: 'current_semester',
    maxLength: 255,
  })
  @IsString({ message: 'Key phải là chuỗi.' })
  @IsNotEmpty({ message: 'Key không được để trống.' })
  @MaxLength(255, { message: 'Key không được dài quá 255 ký tự.' })
  key: string;

  /**
   * @property {string} value - Giá trị của cài đặt.
   * @example '20241'
   */
  @ApiProperty({
    description:
      'Giá trị của cài đặt. Gửi dưới dạng chuỗi. Có thể là JSON stringified nếu giá trị là đối tượng/mảng.',
    examples: ['"20241"', '"true"', '"{"semesterId": "20241", "year": 2024 }"'],
  })
  @IsString({ message: 'Value phải là chuỗi.' })
  @IsNotEmpty({ message: 'Value không được để trống.' })
  value: string;

  /**
   * @property {string} description - Mô tả tùy chọn về ý nghĩa của cài đặt này.
   * @example 'Học kỳ hiện tại của hệ thống'
   */
  @ApiPropertyOptional({
    description: 'Mô tả tùy chọn về ý nghĩa của cài đặt này.',
    example: 'Học kỳ hiện tại của hệ thống',
    maxLength: 500,
  })
  @IsString({ message: 'Description phải là chuỗi.' })
  @MaxLength(500, { message: 'Description không được dài quá 500 ký tự.' })
  description?: string;
}
