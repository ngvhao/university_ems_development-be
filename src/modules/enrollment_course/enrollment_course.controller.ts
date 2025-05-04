import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  Req,
  ForbiddenException,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { EnrollmentCourseService } from './enrollment_course.service';
import { Roles } from 'src/decorators/roles.decorator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { FilterEnrollmentCourseDto } from './dtos/filterEnrollmentCourse.dto';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { EnrollmentCourseEntity } from './entities/enrollment_course.entity';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

@ApiTags('Quản lý Đăng ký Môn học (Enrollments)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentCourseController {
  constructor(private readonly enrollmentService: EnrollmentCourseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({ summary: 'Tạo một lượt đăng ký môn học mới' })
  @ApiBody({ type: CreateEnrollmentCourseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đăng ký thành công.',
    type: EnrollmentCourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ (thiếu studentId, lớp đầy, lớp không mở,...).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Không có quyền thực hiện (vd: user không có profile SV, cố đăng ký cho SV khác).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Không tìm thấy Nhóm lớp hoặc Sinh viên (nếu studentId được cung cấp).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sinh viên đã đăng ký nhóm lớp này rồi.',
  })
  async create(
    @Body() createDto: CreateEnrollmentCourseDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const data = await this.enrollmentService.create(createDto, currentUser);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: data,
      message: 'Đăng ký môn học thành công.',
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
      'Lấy danh sách lượt đăng ký (Admin/Manager xem tất cả/lọc, Student chỉ xem của mình)',
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
    name: 'classGroupId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Nhóm lớp học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EEnrollmentStatus,
    description: 'Lọc theo trạng thái đăng ký',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem (vd: Student cố xem của người khác).',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterEnrollmentCourseDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;

    if (filterDto.studentId && currentUser.role === EUserRole.STUDENT) {
      try {
        const studentProfile = await this.enrollmentService[
          'studentService'
        ].findOneById(currentUser.id);
        if (!studentProfile || studentProfile.id !== filterDto.studentId) {
          throw new ForbiddenException(
            'Sinh viên chỉ được xem đăng ký của chính mình.',
          );
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new ForbiddenException(
            'Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên.',
          );
        }
        throw error;
      }
    }

    const result = await this.enrollmentService.findAll(
      paginationDto,
      filterDto,
      currentUser,
    );
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách đăng ký thành công.',
    }).send(res);
  }

  @Get('/my')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.STUDENT])
  @ApiOperation({ summary: '[Student] Lấy danh sách đăng ký của bản thân' })
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
    name: 'classGroupId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Nhóm lớp học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EEnrollmentStatus,
    description: 'Lọc theo trạng thái đăng ký',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không phải sinh viên hoặc chưa liên kết hồ sơ SV.',
  })
  async findMyEnrollments(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: Omit<FilterEnrollmentCourseDto, 'studentId'>,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;

    const result = await this.enrollmentService.findAll(
      paginationDto,
      filterDto,
      currentUser,
    );
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách đăng ký của bạn thành công.',
    }).send(res);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.STUDENT,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một lượt đăng ký' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của lượt đăng ký' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: EnrollmentCourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem lượt đăng ký này.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lượt đăng ký.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const data = await this.enrollmentService.findOne(id, currentUser);
    return new SuccessResponse({
      data: data,
      message: 'Lấy thông tin đăng ký thành công.',
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
  @ApiOperation({ summary: 'Hủy một lượt đăng ký môn học' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của lượt đăng ký cần hủy',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hủy đăng ký thành công.',
    type: EnrollmentCourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể hủy (đã hủy, lớp bị khóa,...).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền hủy lượt đăng ký này.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lượt đăng ký.',
  })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const data = await this.enrollmentService.cancel(id, currentUser);
    return new SuccessResponse({
      data: data,
      message: 'Hủy đăng ký môn học thành công.',
    }).send(res);
  }

  // @Delete(':id')
  // @UseGuards(RolesGuard)
  // @Roles([EUserRole.ADMINISTRATOR])
  // @ApiOperation({ summary: '[Admin Only] Xóa vĩnh viễn một lượt đăng ký' })
  // ...
  // async hardRemove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) { ... }
}
