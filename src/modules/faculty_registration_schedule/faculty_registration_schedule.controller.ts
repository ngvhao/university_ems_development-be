import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FacultyRegistrationScheduleService } from './faculty_registration_schedule.service';
import { CreateFacultyRegistrationScheduleDto } from './dtos/createFacultyRegistrationSchedule.dto';
import { UpdateFacultyRegistrationScheduleDto } from './dtos/updateFacultyRegistrationSchedule.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FacultyRegistrationScheduleEntity } from './entities/faculty_registration_schedule.entity';

@ApiTags('Quản lý Lịch đăng ký theo Khoa (Faculty Registration Schedules)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('faculty-registration-schedules')
export class FacultyRegistrationScheduleController {
  constructor(
    private readonly scheduleService: FacultyRegistrationScheduleService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một lịch đăng ký mới cho Khoa theo Học kỳ' })
  @ApiBody({ type: CreateFacultyRegistrationScheduleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo lịch thành công.',
    type: FacultyRegistrationScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ (sai định dạng ngày, thứ tự ngày sai,...).',
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
    description: 'Không tìm thấy Khoa hoặc Học kỳ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Đã tồn tại lịch cho Khoa và Học kỳ này.',
  })
  async create(
    @Body() createDto: CreateFacultyRegistrationScheduleDto,
    @Res() res: Response,
  ) {
    const schedule = await this.scheduleService.create(createDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: schedule,
      message: 'Tạo lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Get(':id')
  @Roles([
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Lấy danh sách lịch đăng ký khoa (có phân trang)' })
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
  @ApiQuery({
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Khoa',
  })
  @ApiQuery({
    name: 'semesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Học kỳ',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách lịch thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Param() id: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.scheduleService.findAll(paginationDto, id);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Get(':id')
  @Roles([
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một lịch đăng ký khoa bằng ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID của lịch đăng ký' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: FacultyRegistrationScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch đăng ký.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const schedule = await this.scheduleService.findOne(id);
    return new SuccessResponse({
      data: schedule,
      message: 'Lấy thông tin lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một lịch đăng ký khoa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của lịch cần cập nhật',
  })
  @ApiBody({ type: UpdateFacultyRegistrationScheduleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: FacultyRegistrationScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ (sai định dạng ngày, thứ tự ngày sai,...).',
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
    description: 'Không tìm thấy lịch đăng ký hoặc Khoa/Học kỳ mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lịch đăng ký cập nhật bị trùng lặp.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacultyRegistrationScheduleDto,
    @Res() res: Response,
  ) {
    const schedule = await this.scheduleService.update(id, updateDto);
    return new SuccessResponse({
      data: schedule,
      message: 'Cập nhật lịch đăng ký khoa thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một lịch đăng ký khoa' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của lịch cần xóa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
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
    description: 'Không tìm thấy lịch đăng ký.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.scheduleService.remove(id);
    return new SuccessResponse({
      message: 'Xóa lịch đăng ký khoa thành công',
    }).send(res);
  }
}
