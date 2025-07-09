import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ClassAdjustmentScheduleService } from './class_adjustment_schedule.service';
import { SuccessResponse } from 'src/utils/response';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateAdjustmentScheduleDto } from './dto/createClassAdjustmentSchedule.dto';
import { UpdateAdjustmentScheduleDto } from './dto/updateClassAdjustmentSchedule.dto';
import { ClassAdjustmentScheduleEntity } from './entities/class_adjustment_schedule.entity';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { RequestHasStudentDto } from 'src/utils/request-has-student-dto';
import { FilterClassAdjustmentScheduleDto } from './dto/filterClasAdjustmentSchedule.dto';
import { RequestHasLecturerDto } from 'src/utils/request-has-lecturer-dto';
import { LecturerInterceptor } from 'src/interceptors/get-lecturer.interceptor';

@ApiTags('Quản lý Lịch học Điều chỉnh (Class Adjustment Schedules)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('class-adjustment-schedules')
export class ClassAdjustmentScheduleController {
  constructor(
    private readonly classAdjustmentService: ClassAdjustmentScheduleService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo mới một lịch học điều chỉnh' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo lịch điều chỉnh thành công.',
    type: ClassAdjustmentScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc không thể tạo lịch.',
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
    description: 'Không tìm thấy Nhóm lớp, Phòng hoặc Khung giờ.',
  })
  async create(@Body() dto: CreateAdjustmentScheduleDto, @Res() res: Response) {
    const schedule = await this.classAdjustmentService.create(dto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Tạo lịch điều chỉnh thành công',
      data: schedule,
    }).send(res);
  }

  @Get('students/my-schedule')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.STUDENT])
  @UseInterceptors(StudentInterceptor)
  @ApiOperation({ summary: '[Student] Lấy lịch học cá nhân' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch học cá nhân thành công.',
    type: [ClassAdjustmentScheduleEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc không phải sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền (ví dụ: không phải là sinh viên).',
  })
  async getMySchedule(
    @Query() query: FilterClassAdjustmentScheduleDto,
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const { semesterCode } = query;
    const student = req.student!;
    const data =
      await this.classAdjustmentService.getAdjustedSchedulesByStudentId(
        student.id,
        semesterCode,
      );
    return new SuccessResponse({
      data,
      message: 'Lấy lịch học cá nhân được chỉnh sửa thành công',
    }).send(res);
  }

  @Get('lecturers/my-schedule')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.LECTURER])
  @UseInterceptors(LecturerInterceptor)
  @ApiOperation({ summary: '[Lecturer] Lấy lịch học cá nhân' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch học cá nhân thành công.',
    type: [ClassAdjustmentScheduleEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc không phải sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền (ví dụ: không phải là sinh viên).',
  })
  async getMyScheduleLecturer(
    @Query() query: FilterClassAdjustmentScheduleDto,
    @Req() req: RequestHasLecturerDto & Request,
    @Res() res: Response,
  ) {
    const { semesterCode, classGroupIds } = query;
    const lecturer = req.lecturer!;
    const data =
      await this.classAdjustmentService.getAdjustedSchedulesByLecturerId(
        lecturer.id,
        semesterCode,
        classGroupIds,
      );
    return new SuccessResponse({
      data,
      message: 'Lấy lịch học cá nhân được chỉnh sửa thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch điều chỉnh (có phân trang)' })
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
    description: 'Lấy danh sách lịch điều chỉnh thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } =
      await this.classAdjustmentService.findAll(paginationDto);
    return new SuccessResponse({
      message: 'Lấy danh sách lịch điều chỉnh thành công',
      data,
      metadata: meta,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một lịch điều chỉnh bằng ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin lịch điều chỉnh thành công.',
    type: ClassAdjustmentScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch điều chỉnh.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const schedule = await this.classAdjustmentService.findOne(id);
    return new SuccessResponse({
      message: 'Lấy thông tin lịch điều chỉnh thành công',
      data: schedule,
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một lịch điều chỉnh' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật lịch điều chỉnh thành công.',
    type: ClassAdjustmentScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc không thể cập nhật.',
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
    description:
      'Không tìm thấy lịch điều chỉnh, Nhóm lớp, Phòng hoặc Khung giờ.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdjustmentScheduleDto,
    @Res() res: Response,
  ) {
    const schedule = await this.classAdjustmentService.update(id, dto);
    return new SuccessResponse({
      message: 'Cập nhật lịch điều chỉnh thành công',
      data: schedule,
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một lịch điều chỉnh' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa lịch điều chỉnh thành công.',
  }) // Trạng thái OK (200) khi xóa và có body trả về
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
    description: 'Không tìm thấy lịch điều chỉnh.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classAdjustmentService.remove(id);
    return new SuccessResponse({
      message: 'Xóa lịch điều chỉnh thành công',
    }).send(res);
  }
}
