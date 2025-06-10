import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSettingDto } from './dto/createSetting.dto';
import { UpdateSettingDto } from './dto/updateSetting.dto';
import { SettingEntity } from './entities/setting.entity';

/**
 * @class SettingService
 * @description Service quản lý các cài đặt hệ thống.
 * Bao gồm cơ chế cache trong bộ nhớ để cải thiện hiệu suất đọc.
 * Xử lý giá trị 'value' linh hoạt với kiểu JSON.
 */
@Injectable()
export class SettingService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private settingsCache: Map<string, any> = new Map();

  constructor(
    @InjectRepository(SettingEntity)
    private settingsRepository: Repository<SettingEntity>,
  ) {}

  /**
   * @method onModuleInit
   * @description Được gọi khi module Settings được khởi tạo.
   * Tải tất cả cài đặt từ database vào cache.
   */
  async onModuleInit() {
    await this.loadSettingsToCache();
  }

  /**
   * @private
   * @method loadSettingsToCache
   * @description Tải tất cả cài đặt từ database vào cache.
   * Giá trị 'value' sẽ được TypeORM tự động parse khi đọc từ cột 'json'.
   */
  private async loadSettingsToCache(): Promise<void> {
    try {
      const settings = await this.settingsRepository.find();
      this.settingsCache.clear();
      settings.forEach((setting) => {
        this.settingsCache.set(setting.key, setting.value);
      });
      console.log('Settings loaded to cache successfully.');
    } catch (error) {
      console.error('Failed to load settings to cache:', error);
      throw new InternalServerErrorException('Không thể tải cài đặt hệ thống.');
    }
  }

  /**
   * @method reloadSettings
   * @description Buộc tải lại tất cả cài đặt từ database vào cache.
   * Hữu ích sau khi có sự thay đổi bên ngoài ứng dụng (ví dụ: cập nhật thủ công trong DB).
   */
  async reloadSettings(): Promise<void> {
    await this.loadSettingsToCache();
  }

  /**
   * @method create
   * @param {CreateSettingDto} createSettingDto - Dữ liệu để tạo cài đặt mới.
   * @returns {Promise<SettingEntity>} Bản ghi cài đặt đã được tạo.
   * @description Tạo một cài đặt mới trong database và cập nhật cache.
   * Giá trị 'value' từ DTO (string) sẽ được TypeORM chuyển đổi sang JSON khi lưu.
   */
  async create(createSettingDto: CreateSettingDto): Promise<SettingEntity> {
    try {
      const existingSetting = await this.settingsRepository.findOne({
        where: { key: createSettingDto.key },
      });
      if (existingSetting) {
        throw new Error(
          `Cài đặt với key '${createSettingDto.key}' đã tồn tại.`,
        );
      }

      const newSetting = this.settingsRepository.create({
        key: createSettingDto.key,
        value: this.tryParseJson(createSettingDto.value),
        description: createSettingDto.description,
      });

      const savedSetting = await this.settingsRepository.save(newSetting);
      this.settingsCache.set(savedSetting.key, savedSetting.value);
      return savedSetting;
    } catch (error) {
      console.error('Lỗi khi tạo cài đặt:', error);
      throw new InternalServerErrorException(
        `Không thể tạo cài đặt: ${error.message}`,
      );
    }
  }

  /**
   * @method findAll
   * @returns {Promise<SettingEntity[]>} Danh sách tất cả các cài đặt.
   * @description Lấy tất cả cài đặt từ database (thường dùng cho trang quản trị).
   */
  async findAll(): Promise<SettingEntity[]> {
    return this.settingsRepository.find();
  }

  /**
   * @method findOne
   * @param {string} key - Key của cài đặt cần tìm.
   * @returns {Promise<SettingEntity>} Bản ghi cài đặt.
   * @throws {NotFoundException} Nếu không tìm thấy cài đặt.
   * @description Tìm một cài đặt cụ thể bằng key từ database.
   */
  async findOne(key: string): Promise<SettingEntity> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Không tìm thấy cài đặt với key: ${key}`);
    }
    return setting;
  }

  /**
   * @method update
   * @param {string} key - Key của cài đặt cần cập nhật.
   * @param {UpdateSettingDto} updateSettingDto - Dữ liệu để cập nhật cài đặt.
   * @returns {Promise<SettingEntity>} Bản ghi cài đặt đã được cập nhật.
   * @throws {NotFoundException} Nếu không tìm thấy cài đặt.
   * @description Cập nhật một cài đặt hiện có trong database và cập nhật cache.
   */
  async update(
    key: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<SettingEntity> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Không tìm thấy cài đặt với key: ${key}`);
    }

    if (updateSettingDto.value !== undefined) {
      setting.value = this.tryParseJson(updateSettingDto.value);
    }
    if (updateSettingDto.description !== undefined) {
      setting.description = updateSettingDto.description;
    }

    const updatedSetting = await this.settingsRepository.save(setting);
    this.settingsCache.set(updatedSetting.key, updatedSetting.value);
    return updatedSetting;
  }

  /**
   * @method remove
   * @param {string} key - Key của cài đặt cần xóa.
   * @returns {Promise<void>}
   * @throws {NotFoundException} Nếu không tìm thấy cài đặt.
   * @description Xóa một cài đặt khỏi database và khỏi cache.
   */
  async remove(key: string): Promise<void> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Không tìm thấy cài đặt với key: ${key}`);
    }
    await this.settingsRepository.remove(setting);
    this.settingsCache.delete(key);
  }

  /**
   * @method getSettingFromCache
   * @param {string} key - Key của cài đặt cần lấy.
   * @returns {any | undefined} Giá trị của cài đặt từ cache (đã được parse), hoặc undefined nếu không tìm thấy.
   * @description Lấy giá trị của một cài đặt từ cache trong bộ nhớ.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSettingFromCache(key: string): any | undefined {
    return this.settingsCache.get(key);
  }

  /**
   * @method getCurrentSemester
   * @returns {string | undefined} Giá trị của học kỳ hiện tại từ cache (ví dụ: '20241').
   * @description Phương thức tiện ích để lấy học kỳ hiện tại, giả định nó là chuỗi.
   */
  getCurrentSemester(): string | undefined {
    const semester = this.getSettingFromCache('current_semester');
    return typeof semester === 'string' ? semester : undefined;
  }

  /**
   * @method isSystemMaintenanceMode
   * @returns {boolean} True nếu hệ thống đang ở chế độ bảo trì, ngược lại là false.
   * @description Phương thức tiện ích để kiểm tra chế độ bảo trì, giả định nó là boolean.
   */
  isSystemMaintenanceMode(): boolean {
    // Giá trị 'value' trong cache là 'any', kiểm tra nếu nó là boolean hoặc chuyển đổi từ string
    const mode = this.getSettingFromCache('system_maintenance_mode');
    return (
      mode === true ||
      (typeof mode === 'string' && mode.toLowerCase() === 'true')
    );
  }

  /**
   * @private
   * @method tryParseJson
   * @param {string} str - Chuỗi cần kiểm tra và parse.
   * @returns {any} Kết quả parse JSON nếu hợp lệ, ngược lại trả về chuỗi gốc.
   * @description Helper function để cố gắng parse một chuỗi thành JSON.
   */
  private tryParseJson(str: string): JSON | string {
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return parsed;
    } catch (e) {
      console.log('Error when trying to parse json:', e);
      return str;
    }
  }
}
