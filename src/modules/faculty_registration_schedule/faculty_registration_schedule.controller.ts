// src/faculty-registration-schedule/faculty-registration-schedule.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe, // Sử dụng ParseIntPipe để chuyển đổi id
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  NotFoundException, // Import NotFoundException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Đường dẫn có thể cần điều chỉnh
import { RolesGuard } from '../auth/guards/roles.guard'; // Đường dẫn có thể cần điều chỉnh
import { EUserRole } from 'src/utils/enums/user.enum'; // Đường dẫn có thể cần điều chỉnh
import { Roles } from 'src/decorators/roles.decorator'; // Đường dẫn có thể cần điều chỉnh
import { SuccessResponse } from 'src/utils/response'; // Đường dẫn có thể cần điều chỉnh
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto'; // Đường dẫn có thể cần điều chỉnh
import { FacultyRegistrationScheduleService } from './faculty_registration_schedule.service';
import { CreateFacultyRegistrationScheduleDto } from './dtos/createFacultyRegistrationSchedule.dto';
import { UpdateFacultyRegistrationScheduleDto } from './dtos/updateFacultyRegistrationSchedule.dto';

@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
@Controller('faculty-registration-schedules') // Đặt tên route hợp lý
export class FacultyRegistrationScheduleController {
  constructor(
    private readonly scheduleService: FacultyRegistrationScheduleService,
  ) {}

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole.ACADEMIC_MANAGER[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createDto: CreateFacultyRegistrationScheduleDto,
    @Res() res: Response,
  ) {
    const schedule = await this.scheduleService.create(createDto);
    return new SuccessResponse({
      data: schedule,
      message: 'Tạo lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.LECTURER],
    EUserRole[EUserRole.STUDENT],
  ])
  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.scheduleService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.LECTURER],
    EUserRole[EUserRole.STUDENT],
  ])
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const schedule = await this.scheduleService.findOne(id);
    return new SuccessResponse({
      data: schedule,
      message: 'Lấy thông tin lịch đăng ký khoa thành công',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacultyRegistrationScheduleDto,
    @Res() res: Response,
  ) {
    try {
      const schedule = await this.scheduleService.update(id, updateDto);
      return new SuccessResponse({
        data: schedule,
        message: 'Cập nhật lịch đăng ký khoa thành công',
      }).send(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new SuccessResponse({
          statusCode: 404,
          message: error.message,
        }).send(res);
      }
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      await this.scheduleService.remove(id);
      return new SuccessResponse({
        message: 'Xóa lịch đăng ký khoa thành công',
      }).send(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return new SuccessResponse({
          statusCode: 404,
          message: error.message,
        }).send(res);
      }
      throw error;
    }
  }
}
