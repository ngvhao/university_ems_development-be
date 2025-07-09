import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  ParseIntPipe,
  Res,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RoomService } from './room.service';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { UpdateRoomDto } from './dtos/updateRoom.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SuccessResponse } from 'src/utils/response';
import { FreeClassroomResponseDto } from './dtos/freeClassroomResponse.dto';

@ApiTags('Quản lý Phòng học (Rooms)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo phòng học mới' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tạo phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async create(@Body() createRoomDto: CreateRoomDto, @Res() res: Response) {
    const room = await this.roomService.create(createRoomDto);
    new SuccessResponse({
      data: room,
      message: 'Tạo phòng thành công.',
    }).send(res);
  }

  @Get('free-classroom')
  @ApiOperation({
    summary: 'Lấy danh sách phòng học có ca trống trong ngày',
    description:
      'Trả về danh sách các phòng học còn có ít nhất 1 ca trống trong ngày được chỉ định, kèm theo thông tin các ca trống',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Ngày cần kiểm tra (định dạng YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách phòng học có ca trống thành công.',
    type: [FreeClassroomResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Định dạng ngày không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async getFreeClassroom(@Query('date') date: string, @Res() res: Response) {
    const data = await this.roomService.getFreeClassroom(date);
    new SuccessResponse({
      data,
      message: 'Lấy danh sách phòng học có ca trống thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một phòng học' })
  @ApiParam({ name: 'id', description: 'ID của phòng', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const room = await this.roomService.findOne(id);
    new SuccessResponse({
      data: room,
      message: 'Lấy thông tin phòng thành công.',
    }).send(res);
  }
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phòng học (phân trang)' })
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
    description: 'Số lượng mục mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.roomService.findAll({}, paginationDto);
    new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách phòng thành công.',
    }).send(res);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin phòng học' })
  @ApiParam({
    name: 'id',
    description: 'ID của phòng cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Res() res: Response,
  ) {
    const room = await this.roomService.update(id, updateRoomDto);
    new SuccessResponse({
      data: room,
      message: 'Cập nhật phòng thành công.',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa phòng học' })
  @ApiParam({ name: 'id', description: 'ID của phòng cần xóa', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa phòng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phòng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.roomService.remove(id);
    new SuccessResponse({
      message: 'Xóa phòng thành công.',
    }).send(res);
  }

  @Get('test-role')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Test endpoint để debug role' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test role thành công.',
  })
  async testRole(@Res() res: Response) {
    console.log('RoomController.testRole - Endpoint accessed successfully');
    new SuccessResponse({
      data: { message: 'Role test successful' },
      message: 'Test role thành công.',
    }).send(res);
  }
}
