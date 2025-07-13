import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExamScheduleService } from './exam_schedule.service';
import { CreateExamScheduleDto } from './dtos/createExamSchedule.dto';
import { UpdateExamScheduleDto } from './dtos/updateExamSchedule.dto';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { Response, Request } from 'express';
import { SuccessResponse } from 'src/utils/response';
import { HttpStatus } from '@nestjs/common';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { FilterExamScheduleDto } from './dtos/filterExamSchedule.dto';

@ApiTags('Exam Schedules')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('exam-schedules')
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  @Get('student/schedule')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.STUDENT])
  @ApiOperation({
    summary: 'Lấy lịch thi của sinh viên theo học kỳ',
    description:
      'Lấy danh sách lịch thi của sinh viên đang đăng nhập theo mã học kỳ',
  })
  @ApiQuery({
    name: 'semesterCode',
    required: true,
    type: String,
    description: 'Mã học kỳ (ví dụ: 2024-1, 2024-2)',
    example: '2024-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy lịch thi thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học kỳ hoặc sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async getStudentExamSchedule(
    @Query('semesterCode') semesterCode: string,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const user = req.user;
    const examSchedules =
      await this.examScheduleService.getExamScheduleByUserAndSemester(
        user.id,
        semesterCode,
      );
    return new SuccessResponse({
      message: 'Lấy lịch thi thành công',
      data: examSchedules,
    }).send(res);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exam schedule' })
  @ApiResponse({
    status: 201,
    description: 'Exam schedule created successfully',
    type: ExamScheduleEntity,
  })
  create(
    @Body() createExamScheduleDto: CreateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    return this.examScheduleService.create(createExamScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch thi (có phân trang và lọc)' })
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
    name: 'semesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID học kỳ',
  })
  @ApiQuery({
    name: 'classGroupId',
    required: false,
    type: Number,
    description: 'Lọc theo ID nhóm lớp',
  })
  @ApiQuery({
    name: 'examType',
    required: false,
    type: String,
    description: 'Lọc theo loại thi',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lịch thi thành công',
    type: [ExamScheduleEntity],
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterExamScheduleDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.examScheduleService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      data: result.data,
      metadata: result.meta,
      message: 'Lấy danh sách lịch thi thành công',
    }).send(res);
  }

  @Get('class-group/:classGroupId')
  @ApiOperation({ summary: 'Get exam schedules by class group' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedules for specific class group',
    type: [ExamScheduleEntity],
  })
  findByClassGroup(
    @Param('classGroupId') classGroupId: string,
  ): Promise<ExamScheduleEntity[]> {
    return this.examScheduleService.findByClassGroup(+classGroupId);
  }

  @Get('semester/:semesterId')
  @ApiOperation({ summary: 'Get exam schedules by semester' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedules for specific semester',
    type: [ExamScheduleEntity],
  })
  findBySemester(
    @Param('semesterId') semesterId: string,
  ): Promise<ExamScheduleEntity[]> {
    return this.examScheduleService.findBySemester(+semesterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam schedule by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedule by ID',
    type: ExamScheduleEntity,
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  findOne(@Param('id') id: string): Promise<ExamScheduleEntity> {
    return this.examScheduleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exam schedule' })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule updated successfully',
    type: ExamScheduleEntity,
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  update(
    @Param('id') id: string,
    @Body() updateExamScheduleDto: UpdateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    return this.examScheduleService.update(+id, updateExamScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exam schedule' })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.examScheduleService.remove(+id);
  }
}
