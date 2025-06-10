// src/settings/settings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SuccessResponse } from 'src/utils/response';
import { CreateSettingDto } from './dto/createSetting.dto';
import { UpdateSettingDto } from './dto/updateSetting.dto';
import { SettingService } from './setting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

/**
 * @class SettingController
 * @description Controller xử lý các yêu cầu API liên quan đến cài đặt hệ thống.
 * Các endpoint này thường dành cho vai trò quản trị viên.
 */
@ApiTags('Settings')
@ApiBearerAuth('token')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles([EUserRole.ADMINISTRATOR])
export class SettingController {
  constructor(private readonly SettingService: SettingService) {}

  @Post()
  async create(
    @Body() createSettingDto: CreateSettingDto,
    @Res() res: Response,
  ) {
    const setting = await this.SettingService.create(createSettingDto);
    return new SuccessResponse({
      data: setting,
      message: 'Tạo cài đặt thành công.',
      statusCode: HttpStatus.CREATED,
    }).send(res);
  }

  @Get()
  async findAll(@Res() res: Response) {
    const settings = await this.SettingService.findAll();
    return new SuccessResponse({
      data: settings,
      message: 'Lấy tất cả cài đặt thành công.',
    }).send(res);
  }

  @Get(':key')
  async findOne(@Param('key') key: string, @Res() res: Response) {
    const setting = await this.SettingService.findOne(key);
    return new SuccessResponse({
      data: setting,
      message: `Lấy cài đặt '${key}' thành công.`,
    }).send(res);
  }

  @Patch(':key')
  async update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Res() res: Response,
  ) {
    const updatedSetting = await this.SettingService.update(
      key,
      updateSettingDto,
    );
    return new SuccessResponse({
      data: updatedSetting,
      message: `Cập nhật cài đặt '${key}' thành công.`,
    }).send(res);
  }

  @Delete(':key')
  async remove(@Param('key') key: string, @Res() res: Response) {
    await this.SettingService.remove(key);
    return new SuccessResponse({
      message: `Xóa cài đặt '${key}' thành công.`,
      statusCode: HttpStatus.NO_CONTENT,
    }).send(res);
  }

  @Get('current-semester')
  async getCurrentSemester(@Res() res: Response) {
    const currentSemester = this.SettingService.getCurrentSemester();
    if (!currentSemester) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'Học kỳ hiện tại chưa được cấu hình.',
        data: null,
      });
    }
    return new SuccessResponse({
      data: currentSemester,
      message: 'Lấy học kỳ hiện tại thành công.',
    }).send(res);
  }

  @Post('reload-cache')
  async reloadSettings(@Res() res: Response) {
    await this.SettingService.reloadSettings();
    return new SuccessResponse({
      message: 'Đã tải lại cài đặt vào cache thành công.',
    }).send(res);
  }
}
