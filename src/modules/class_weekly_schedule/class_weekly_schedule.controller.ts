import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateClassWeeklyScheduleDto } from './dtos/createClassWeeklySchedule.dto';
import { UpdateClassWeeklyScheduleDto } from './dtos/updateClassWeeklySchedule.dto';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { RequestHasStudentDto } from 'src/utils/request-has-student-dto';
import { ClassWeeklyScheduleService } from './class_weekly_schedule.service';
import { ClassWeeklyScheduleEntity } from './entities/class_weekly_schedule.entity';
import { EnrollmentCourseService } from '../enrollment_course/enrollment_course.service';

@ApiTags('Quản lý Lịch học Hàng tuần (Class Weekly Schedules)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('class-weekly-schedules')
export class ClassWeeklyScheduleController {
  constructor(
    private readonly classWeeklyScheduleService: ClassWeeklyScheduleService,
    private readonly enrollmentService: EnrollmentCourseService,
  ) {}

  @Post()
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một lịch học hàng tuần mới' })
  @ApiBody({ type: CreateClassWeeklyScheduleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo lịch học thành công.',
    type: ClassWeeklyScheduleEntity,
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
    description: 'Không tìm thấy Nhóm lớp, Phòng hoặc Khung giờ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Lịch học bị trùng lặp (cùng nhóm, ngày, giờ hoặc cùng phòng, ngày, giờ).',
  })
  async create(
    @Body() dto: CreateClassWeeklyScheduleDto,
    @Res() res: Response,
  ) {
    const data = await this.classWeeklyScheduleService.create(dto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data,
      message: 'Tạo lịch học hàng tuần thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch học hàng tuần (có phân trang)' })
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
    description: 'Lấy danh sách lịch học thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } =
      await this.classWeeklyScheduleService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách lịch học hàng tuần thành công',
    }).send(res);
  }

  @Get('student/my-general-info')
  @Roles([EUserRole.STUDENT])
  @UseInterceptors(StudentInterceptor)
  @ApiOperation({ summary: '[Student] Lấy lịch học cá nhân' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch học cá nhân thành công.',
    type: [ClassWeeklyScheduleEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc không phải sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền (ví dụ: không phải là sinh viên).',
  })
  async getMyGeneralInfo(
    @Query() query: { semesterCode: string },
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const { semesterCode } = query;
    const student = req.student!;
    const enrollments =
      await this.enrollmentService.findEnrollmentNumberBySemester(
        semesterCode,
        student.id,
      );
    const schedules =
      await this.classWeeklyScheduleService.getTodayScheduleByStudentId(
        student.id,
      );
    return new SuccessResponse({
      data: {
        enrollmentNumber: enrollments,
        todayScheduleNumber: schedules,
      },
      message: 'Lấy lịch học cá nhân theo tuần thành công',
    }).send(res);
  }

  @Get('student/my-schedule')
  @Roles([EUserRole.STUDENT])
  @UseInterceptors(StudentInterceptor)
  @ApiOperation({ summary: '[Student] Lấy lịch học cá nhân' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch học cá nhân thành công.',
    type: [ClassWeeklyScheduleEntity],
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
    @Query() query: { semesterCode: string },
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const { semesterCode } = query;
    const student = req.student!;
    const data = await this.classWeeklyScheduleService.getScheduleByStudentId(
      student.id,
      semesterCode,
    );
    return new SuccessResponse({
      data,
      message: 'Lấy lịch học cá nhân theo tuần thành công',
    }).send(res);
  }

  @Get('student/:studentId')
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: '[Admin/Academic] Lấy lịch học của một sinh viên cụ thể',
  })
  @ApiParam({
    name: 'studentId',
    type: Number,
    description: 'ID của sinh viên cần xem lịch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch học của sinh viên thành công.',
    type: [ClassWeeklyScheduleEntity],
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
    description: 'Không tìm thấy sinh viên.',
  })
  async getScheduleByStudentId(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Res() res: Response,
  ) {
    const data =
      await this.classWeeklyScheduleService.getScheduleByStudentId(studentId);
    return new SuccessResponse({
      data,
      message: `Lấy lịch học của sinh viên ID ${studentId} thành công`,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một lịch học hàng tuần bằng ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID của lịch học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin lịch học thành công.',
    type: ClassWeeklyScheduleEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lịch học.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.classWeeklyScheduleService.findOne(id);
    return new SuccessResponse({
      data,
      message: 'Lấy thông tin lịch học hàng tuần thành công',
    }).send(res);
  }

  @Patch(':id')
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một lịch học hàng tuần' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của lịch học cần cập nhật',
  })
  @ApiBody({ type: UpdateClassWeeklyScheduleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật lịch học thành công.',
    type: ClassWeeklyScheduleEntity,
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
    description: 'Không tìm thấy lịch học hoặc Nhóm lớp/Phòng/Khung giờ mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lịch học cập nhật bị trùng lặp.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassWeeklyScheduleDto,
    @Res() res: Response,
  ) {
    const data = await this.classWeeklyScheduleService.update(id, dto);
    return new SuccessResponse({
      data,
      message: 'Cập nhật lịch học hàng tuần thành công',
    }).send(res);
  }

  @Delete(':id')
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một lịch học hàng tuần' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của lịch học cần xóa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa lịch học thành công.',
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
    description: 'Không tìm thấy lịch học.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classWeeklyScheduleService.remove(id);
    return new SuccessResponse({
      message: 'Xóa lịch học hàng tuần thành công',
    }).send(res);
  }
}
