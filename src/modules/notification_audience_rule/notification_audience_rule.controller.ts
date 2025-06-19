import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseIntPipe,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateNotificationAudienceRuleDto } from './dtos/createNotificationAudienceRule.dto';
import { UpdateNotificationAudienceRuleDto } from './dtos/updateNotificationAudienceRule.dto';
import { NotificationRulesService } from './notification_audience_rule.service';

@ApiTags('Quy tắc Thông báo (Audience Rules)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('notifications_rules')
export class NotificationRulesController {
  constructor(
    private readonly notificationRulesService: NotificationRulesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Thêm quy tắc mới vào một thông báo' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo',
    type: Number,
  })
  @ApiBody({ type: CreateNotificationAudienceRuleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thêm quy tắc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo gốc.',
  })
  async create(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Body() createRuleDto: CreateNotificationAudienceRuleDto,
    @Res() res: Response,
  ) {
    const rule = await this.notificationRulesService.createRule(
      notificationId,
      createRuleDto,
    );
    new SuccessResponse({
      data: rule,
      message: 'Thêm quy tắc vào thông báo thành công.',
      statusCode: HttpStatus.CREATED,
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả quy tắc của một thông báo' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách quy tắc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy thông báo gốc.',
  })
  async findAll(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Res() res: Response,
  ) {
    const rules =
      await this.notificationRulesService.findAllRulesForNotification(
        notificationId,
      );
    new SuccessResponse({
      data: rules,
      message: 'Lấy danh sách quy tắc thành công.',
    }).send(res);
  }

  @Get(':ruleId')
  @ApiOperation({ summary: 'Lấy chi tiết một quy tắc' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo',
    type: Number,
  })
  @ApiParam({ name: 'ruleId', description: 'ID của quy tắc', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin quy tắc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quy tắc hoặc thông báo gốc.',
  })
  async findOne(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('ruleId', ParseIntPipe) ruleId: number,
    @Res() res: Response,
  ) {
    const rule = await this.notificationRulesService.findOneRule(
      notificationId,
      ruleId,
    );
    new SuccessResponse({
      data: rule,
      message: 'Lấy thông tin quy tắc thành công.',
    }).send(res);
  }

  @Patch(':ruleId')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật một quy tắc' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo',
    type: Number,
  })
  @ApiParam({
    name: 'ruleId',
    description: 'ID của quy tắc cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateNotificationAudienceRuleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật quy tắc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quy tắc hoặc thông báo gốc.',
  })
  async update(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('ruleId', ParseIntPipe) ruleId: number,
    @Body() updateRuleDto: UpdateNotificationAudienceRuleDto,
    @Res() res: Response,
  ) {
    const rule = await this.notificationRulesService.updateRule(
      notificationId,
      ruleId,
      updateRuleDto,
    );
    new SuccessResponse({
      data: rule,
      message: 'Cập nhật quy tắc thành công.',
    }).send(res);
  }

  @Delete(':ruleId')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa một quy tắc' })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của thông báo',
    type: Number,
  })
  @ApiParam({
    name: 'ruleId',
    description: 'ID của quy tắc cần xóa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa quy tắc thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy quy tắc hoặc thông báo gốc.',
  })
  async remove(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Param('ruleId', ParseIntPipe) ruleId: number,
    @Res() res: Response,
  ) {
    await this.notificationRulesService.removeRule(notificationId, ruleId);
    new SuccessResponse({
      message: 'Xóa quy tắc thành công.',
    }).send(res);
  }
}
