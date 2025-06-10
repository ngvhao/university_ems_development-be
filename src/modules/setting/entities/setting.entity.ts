/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IEntity } from 'src/utils/interfaces/entity.interface';

/**
 * @class Setting
 * @description Entity đại diện cho bảng 'settings' trong database.
 * Lưu trữ các cặp key-value cho cấu hình hệ thống, với 'value' hỗ trợ kiểu JSON.
 */
@Entity('settings')
export class SettingEntity extends IEntity {
  /**
   * @property {string} key - Khóa duy nhất để xác định cài đặt (ví dụ: 'current_semester', 'system_maintenance_mode').
   */
  @Column({ unique: true, length: 255 })
  @ApiProperty({
    description: 'Khóa duy nhất của cài đặt.',
    example: 'current_semester',
  })
  key: string;

  /**
   * @property {any} value - Giá trị của cài đặt, có thể là bất kỳ kiểu dữ liệu JSON nào (chuỗi, số, boolean, đối tượng, mảng).
   * TypeORM sẽ tự động serialize/deserialize khi tương tác với database.
   */
  @Column({ type: 'json' }) // Đã đổi kiểu dữ liệu sang 'json'
  @ApiProperty({
    description:
      'Giá trị của cài đặt. Có thể là chuỗi, số, boolean, đối tượng JSON hoặc mảng JSON.',
    example: '20241', // Ví dụ giá trị string
    // example: true, // Ví dụ giá trị boolean
    // example: { semesterId: '20241', year: 2024, type: 'Fall' }, // Ví dụ giá trị object
  })
  value: any;

  /**
   * @property {string} description - Mô tả tùy chọn về ý nghĩa của cài đặt này.
   */
  @Column({ nullable: true, length: 500 })
  @ApiProperty({
    description: 'Mô tả tùy chọn về cài đặt.',
    example: 'Học kỳ hiện tại của hệ thống.',
  })
  description: string;
}
