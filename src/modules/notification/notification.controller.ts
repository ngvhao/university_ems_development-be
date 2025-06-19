import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuccessResponse } from 'src/utils/response';
import { CreateNotificationDto } from './dtos/createNotification.dto';
import { NotificationQueryDto } from './dtos/notificationQuery.dto';
import { UpdateNotificationDto } from './dtos/updateNotification.dto';
import { NotificationsService } from './notification.service';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';

@ApiTags('Quản lý Thông báo (Notifications)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo thông báo mới' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo thông báo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const createdByUserId = req.user.id;
    const notification = await this.notificationsService.create(
      createNotificationDto,
      createdByUserId,
    );
    new SuccessResponse({
      data: notification,
      message: 'Tạo thông báo thành công.',
      statusCode: HttpStatus.CREATED,
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo (phân trang và lọc)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thông báo thành công.',
  })
  async findAll(@Query() queryDto: NotificationQueryDto, @Res() res: Response) {
    const { data, meta } = await this.notificationsService.findAll(queryDto);
    new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách thông báo thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một thông báo' })
  @ApiParam({ name: 'id', description: 'ID của thông báo', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thông báo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const notification = await this.notificationsService.findOne(id);
    new SuccessResponse({
      data: notification,
      message: 'Lấy thông tin thông báo thành công.',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin thông báo' })
  @ApiParam({
    name: 'id',
    description: 'ID của thông báo cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông báo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Res() res: Response,
  ) {
    const notification = await this.notificationsService.update(
      id,
      updateNotificationDto,
    );
    new SuccessResponse({
      data: notification,
      message: 'Cập nhật thông báo thành công.',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiParam({
    name: 'id',
    description: 'ID của thông báo cần xóa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa thông báo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.notificationsService.remove(id);
    new SuccessResponse({
      message: 'Xóa thông báo thành công.',
    }).send(res);
  }
}
