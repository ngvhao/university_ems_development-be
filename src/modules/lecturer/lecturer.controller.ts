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
  Req,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response, Request } from 'express';
import { CreateLecturerDto } from './dtos/createLecturer.dto';
import { UpdateLecturerDto } from './dtos/updateLecturer.dto';
import { LecturerService } from './lecturer.service';
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
import { LecturerEntity } from './entities/lecturer.entity';
import { LecturerInterceptor } from 'src/interceptors/get-lecturer.interceptor';
import { RequestHasLecturerDto } from 'src/utils/request-has-lecturer-dto';

@ApiTags('Quản lý Giảng viên (Lecturers)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Tạo hồ sơ Giảng viên mới',
  })
  @ApiBody({ type: CreateLecturerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo hồ sơ Giảng viên thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc User không phải Giảng viên.',
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
    description: 'Không tìm thấy User hoặc Khoa/Bộ môn.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User đã được liên kết hoặc Bộ môn đã có Trưởng bộ môn.',
  })
  async create(
    @Body() createLecturerDto: CreateLecturerDto,
    @Res() res: Response,
  ) {
    const lecturer = await this.lecturerService.create(createLecturerDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: lecturer,
      message: 'Tạo hồ sơ Giảng viên thành công',
    }).send(res);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Lấy danh sách Giảng viên' })
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
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.lecturerService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách Giảng viên thành công',
    }).send(res);
  }

  @Get('my-schedule')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.LECTURER])
  @ApiOperation({ summary: '[Giảng viên] Xem lịch giảng dạy được phân công' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch giảng dạy thành công.',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không phải giảng viên hoặc chưa có hồ sơ.',
  })
  @UseInterceptors(LecturerInterceptor)
  async getMyTeachingSchedule(
    @Req() req: RequestHasLecturerDto & Request,
    @Res() res: Response,
  ) {
    const currentLecturer = req.lecturer;
    console.log('currentLecturer', currentLecturer);
    const schedule = null;
    // await this.lecturerService.getMyTeachingSchedule(currentLecturer);
    return new SuccessResponse({
      data: schedule,
      message: 'Lấy lịch giảng dạy thành công.',
    }).send(res);
  }

  // @Post('my-schedule/complaints')
  // @UseGuards(RolesGuard)
  // @Roles([EUserRole.LECTURER])
  // @ApiOperation({
  //   summary: '[Giảng viên] Gửi khiếu nại về lịch giảng dạy lên Trưởng bộ môn',
  // })
  // @ApiBody({ type: CreateComplaintDto })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Gửi khiếu nại thành công.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Nội dung khiếu nại không hợp lệ.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Chưa xác thực.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.FORBIDDEN,
  //   description: 'Không phải giảng viên hoặc chưa có hồ sơ.',
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Không tìm thấy Trưởng bộ môn để gửi.',
  // })
  // async submitScheduleComplaint(
  //   @Req() req: RequestHasUserDto & Request,
  //   @Body() createComplaintDto: CreateComplaintDto,
  //   @Res() res: Response,
  // ) {
  //   const currentUser = req.user;
  //   const result = await this.lecturerService.submitScheduleComplaint(
  //     createComplaintDto,
  //     currentUser,
  //   );
  //   return new SuccessResponse({
  //     statusCode: HttpStatus.CREATED,
  //     message: result.message,
  //     // data: result.complaint // Nếu service trả về complaint đã tạo
  //   }).send(res);
  // }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một Giảng viên bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Giảng viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: LecturerEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Giảng viên.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const lecturer = await this.lecturerService.findOne(id);
    return new SuccessResponse({
      data: lecturer,
      message: 'Lấy thông tin Giảng viên thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ Giảng viên' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID Giảng viên cần cập nhật',
  })
  @ApiBody({ type: UpdateLecturerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: LecturerEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
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
    description: 'Không tìm thấy Giảng viên hoặc Khoa/Bộ môn mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bộ môn mới đã có Trưởng bộ môn.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLecturerDto: UpdateLecturerDto,
    @Res() res: Response,
  ) {
    const lecturer = await this.lecturerService.update(id, updateLecturerDto);
    return new SuccessResponse({
      data: lecturer,
      message: 'Cập nhật hồ sơ Giảng viên thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa hồ sơ Giảng viên' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID Giảng viên cần xóa hồ sơ',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể xóa Giảng viên do còn ràng buộc (lớp chủ nhiệm,...).',
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
    description: 'Không tìm thấy Giảng viên.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.lecturerService.remove(id);
    return new SuccessResponse({
      message: 'Xóa hồ sơ Giảng viên thành công',
    }).send(res);
  }
}
