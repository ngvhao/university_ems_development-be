import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Res,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateTimeSlotDto } from './dto/createTimeSlot.dto';
import { UpdateTimeSlotDto } from './dto/updateTimeSlot.dto';
import { TimeSlotService } from './time_slot.service';
import { TimeSlotEntity } from './entities/time_slot.entity';

@ApiTags('Quản lý Khung giờ học (Time Slots)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một Khung giờ học mới' })
  @ApiBody({ type: CreateTimeSlotDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo Khung giờ thành công.',
    type: TimeSlotEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ (sai định dạng, endTime <= startTime).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Khung giờ đã tồn tại (trùng thời gian hoặc ca/tiết).',
  })
  async create(
    @Body() createTimeSlotDto: CreateTimeSlotDto,
    @Res() res: Response,
  ) {
    const timeSlot = await this.timeSlotService.create(createTimeSlotDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: timeSlot,
      message: 'Tạo Khung giờ thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Khung giờ học' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng kết quả mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành công.',
    type: [TimeSlotEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.timeSlotService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách Khung giờ thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một Khung giờ bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Khung giờ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: TimeSlotEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Khung giờ.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const timeSlot = await this.timeSlotService.findOne(id);
    return new SuccessResponse({
      data: timeSlot,
      message: 'Lấy thông tin Khung giờ thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin một Khung giờ' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID Khung giờ cần cập nhật',
  })
  @ApiBody({ type: UpdateTimeSlotDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: TimeSlotEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ (sai định dạng, endTime <= startTime).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Khung giờ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Khung giờ cập nhật bị trùng lặp.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
    @Res() res: Response,
  ) {
    const timeSlot = await this.timeSlotService.update(id, updateTimeSlotDto);
    return new SuccessResponse({
      data: timeSlot,
      message: 'Cập nhật Khung giờ thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa một Khung giờ' })
  @ApiParam({ name: 'id', type: Number, description: 'ID Khung giờ cần xóa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa Khung giờ do đang được sử dụng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Khung giờ.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.timeSlotService.remove(id);
    return new SuccessResponse({
      message: 'Xóa Khung giờ thành công',
    }).send(res);
  }
}
