import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingDto } from './createSetting.dto';

/**
 * @class UpdateSettingDto
 * @description DTO để cập nhật một cài đặt hiện có.
 * Sử dụng PartialType để tất cả các trường là tùy chọn.
 * Các decorator ApiProperty sẽ tự động được kế thừa.
 */
export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
