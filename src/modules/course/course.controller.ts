import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/createCourse.dto';
import { UpdateCourseDto } from './dtos/updateCourse.dto';
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
import { CourseEntity } from './entities/course.entity';

@ApiTags('Quản lý Môn học (Courses)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một môn học mới' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo môn học thành công.',
    type: CourseEntity,
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
    description: 'Không tìm thấy môn học tiên quyết (nếu có).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã môn học đã tồn tại.',
  })
  async create(@Body() createCourseDto: CreateCourseDto, @Res() res: Response) {
    const course = await this.courseService.create(createCourseDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: course,
      message: 'Tạo môn học thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách môn học (có phân trang)' })
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
    description: 'Lấy danh sách môn học thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.courseService.findAll(paginationDto);
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Lấy danh sách môn học thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một môn học bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của môn học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin môn học thành công.',
    type: CourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy môn học.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const course = await this.courseService.findOne(id);
    return new SuccessResponse({
      data: course,
      message: 'Lấy thông tin môn học thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một môn học' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của môn học cần cập nhật',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật môn học thành công.',
    type: CourseEntity,
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
    description: 'Không tìm thấy môn học hoặc môn tiên quyết mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã môn học mới đã tồn tại.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Res() res: Response,
  ) {
    const course = await this.courseService.update(id, updateCourseDto);
    return new SuccessResponse({
      data: course,
      message: 'Cập nhật môn học thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một môn học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của môn học cần xóa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa môn học thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể xóa môn học do có ràng buộc (đang mở lớp, trong CTĐT,...).',
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
    description: 'Không tìm thấy môn học.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.courseService.remove(id);
    return new SuccessResponse({
      message: 'Xóa môn học thành công',
    }).send(res);
  }
}
