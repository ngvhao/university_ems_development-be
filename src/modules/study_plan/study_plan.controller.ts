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
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { StudyPlanService } from './study_plan.service';
import { CreateStudyPlanDto } from './dtos/createStudyPlan.dto';
import { UpdateStudyPlanDto } from './dtos/updateStudyPlan.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response, Request } from 'express';
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
import { StudyPlanEntity } from './entities/study_plan.entity';
import { FilterStudyPlanDto } from './dtos/filterStudyPlan.dto';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { EStudyPlanStatus } from 'src/utils/enums/study-plan.enum';
import { CurriculumService } from '../curriculum/curriculum.service';
import { SettingService } from '../setting/setting.service';
import { RequestHasStudentDto } from 'src/utils/request-has-student-dto';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { SemesterService } from '../semester/semester.service';

@ApiTags('Quản lý Kế hoạch học tập (Study Plans)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('study-plans')
export class StudyPlanController {
  constructor(
    private readonly studyPlanService: StudyPlanService,
    private readonly curriculumService: CurriculumService,
    private readonly settingService: SettingService,
    private readonly semesterService: SemesterService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({
    summary: 'Thêm một môn học vào kế hoạch học tập (mặc định status=PLANNED)',
  })
  @ApiBody({ type: CreateStudyPlanDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thêm vào kế hoạch thành công.',
    type: StudyPlanEntity,
  })
  async create(
    @Body() createStudyPlanDto: CreateStudyPlanDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const studyPlan = await this.studyPlanService.create(
      createStudyPlanDto,
      currentUser,
    );
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: studyPlan,
      message: 'Thêm vào kế hoạch học tập thành công',
    }).send(res);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({
    summary:
      'Lấy danh sách kế hoạch học tập (Admin/Manager xem/lọc, Student chỉ xem của mình)',
  })
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
    name: 'studentId',
    required: false,
    type: Number,
    description: '[Admin/Manager] Lọc theo ID Sinh viên',
  })
  @ApiQuery({
    name: 'semesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Học kỳ',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Môn học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EStudyPlanStatus,
    description: 'Lọc theo trạng thái (0: Cancelled, 1: Planned)',
    type: 'number',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterStudyPlanDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const result = await this.studyPlanService.findAll(
      currentUser,
      filterDto,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách kế hoạch học tập thành công',
    }).send(res);
  }

  @Get('/me/for-registration')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.STUDENT])
  @UseInterceptors(StudentInterceptor)
  @ApiOperation({ summary: '[Student] Lấy kế hoạch học tập của bản thân' })
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
    description: 'Lọc theo ID Học kỳ',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Môn học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EStudyPlanStatus,
    description: 'Lọc theo trạng thái (0: Cancelled, 1: Planned)',
    type: 'number',
  })
  async getStudyPlanForRegistration(
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const { student } = req;
    console.log('getStudyPlanForRegistration@student:', student);
    const nextRegisterStudyPlanSemester = await this.settingService.findOne(
      'nextRegisterStudyPlanSemesterId',
    );
    const semester = await this.semesterService.findOne(
      nextRegisterStudyPlanSemester.value,
    );
    const curriculum = await this.curriculumService.findCurriculum(student);
    console.log(
      'getStudyPlanForRegistration@@nextRegisterStudyPlanSemester:',
      nextRegisterStudyPlanSemester,
    );
    return new SuccessResponse({
      data: {
        curriculum,
        semesterForRegistration: semester,
      },
      message: 'Lấy kế hoạch học tập của bạn thành công.',
    }).send(res);
  }

  @Get('/me')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.STUDENT])
  @ApiOperation({ summary: '[Student] Lấy kế hoạch học tập của bản thân' })
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
    description: 'Lọc theo ID Học kỳ',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Môn học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EStudyPlanStatus,
    description: 'Lọc theo trạng thái (0: Cancelled, 1: Planned)',
    type: 'number',
  })
  async findMyStudyPlan(
    @Query() filterDto: FilterStudyPlanDto,
    @Query() paginationDto: PaginationDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const result = await this.studyPlanService.findAll(
      currentUser,
      filterDto,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: 'Lấy kế hoạch học tập của bạn thành công.',
    }).send(res);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một mục trong kế hoạch học tập',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của mục trong kế hoạch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: StudyPlanEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem mục này.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy mục kế hoạch.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const studyPlan = await this.studyPlanService.findOneWithAuth(
      id,
      currentUser,
    );

    return new SuccessResponse({
      data: studyPlan,
      message: 'Lấy thông tin kế hoạch học tập thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary:
      '[Admin/Manager] Cập nhật trạng thái một mục trong kế hoạch học tập',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID mục kế hoạch cần cập nhật',
  })
  @ApiBody({ type: UpdateStudyPlanDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: StudyPlanEntity,
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
    description: 'Không có quyền cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy mục kế hoạch.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const studyPlan = await this.studyPlanService.update(
      id,
      updateStudyPlanDto,
      currentUser,
    );
    return new SuccessResponse({
      data: studyPlan,
      message: 'Cập nhật kế hoạch học tập thành công',
    }).send(res);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({
    summary:
      'Hủy một mục trong kế hoạch học tập (chuyển status thành CANCELLED)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID mục kế hoạch cần hủy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hủy thành công.',
    type: StudyPlanEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Kế hoạch đã bị hủy trước đó.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền hủy.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy mục kế hoạch.',
  })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const studyPlan = await this.studyPlanService.cancel(id, currentUser);
    return new SuccessResponse({
      data: studyPlan,
      message: 'Hủy kế hoạch học tập thành công.',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({
    summary: 'Xóa một mục khỏi kế hoạch học tập (chỉ xóa khi chưa đăng ký)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID mục kế hoạch cần xóa',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa mục đã đăng ký.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xóa.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy mục kế hoạch.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    await this.studyPlanService.remove(id, currentUser);
    return new SuccessResponse({
      message: 'Xóa khỏi kế hoạch học tập thành công',
    }).send(res);
  }
}
