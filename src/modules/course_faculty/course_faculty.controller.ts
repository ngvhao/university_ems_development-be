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
import { CourseFacultyService } from './course_faculty.service';
import { CreateCourseFacultyDto } from './dtos/createCourseFaculty.dto';
import { UpdateCourseFacultyDto } from './dtos/updateCourseFaculty.dto';
import { FilterCourseFacultyDto } from './dtos/filterCourseFaculty.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CourseFacultyEntity } from './entities/course_faculty.entity';

@ApiTags('Quản lý Mối quan hệ Môn học - Khoa (Course Faculty)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('course-faculties')
export class CourseFacultyController {
  constructor(private readonly courseFacultyService: CourseFacultyService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo mối quan hệ mới giữa môn học và khoa' })
  @ApiBody({ type: CreateCourseFacultyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo mối quan hệ thành công.',
    type: CourseFacultyEntity,
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
    description: 'Không tìm thấy môn học hoặc khoa.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mối quan hệ đã tồn tại.',
  })
  async create(
    @Body() createCourseFacultyDto: CreateCourseFacultyDto,
    @Res() res: Response,
  ) {
    const courseFaculty = await this.courseFacultyService.create(
      createCourseFacultyDto,
    );
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: courseFaculty,
      message: 'Tạo mối quan hệ môn học - khoa thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({
    summary:
      'Lấy danh sách mối quan hệ môn học - khoa (có phân trang và filter)',
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
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID môn học',
  })
  @ApiQuery({
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Lọc theo ID khoa',
  })
  @ApiQuery({
    name: 'isPrimary',
    required: false,
    type: Boolean,
    description: 'Lọc theo môn học chính của khoa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách mối quan hệ thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Query() filterDto: FilterCourseFacultyDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.courseFacultyService.findAll(filterDto);
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Lấy danh sách mối quan hệ môn học - khoa thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một mối quan hệ môn học - khoa bằng ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của mối quan hệ môn học - khoa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin mối quan hệ thành công.',
    type: CourseFacultyEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy mối quan hệ.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const courseFaculty = await this.courseFacultyService.findOne(id);
    return new SuccessResponse({
      data: courseFaculty,
      message: 'Lấy thông tin mối quan hệ môn học - khoa thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Cập nhật thông tin một mối quan hệ môn học - khoa',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của mối quan hệ cần cập nhật',
  })
  @ApiBody({ type: UpdateCourseFacultyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật mối quan hệ thành công.',
    type: CourseFacultyEntity,
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
    description: 'Không tìm thấy mối quan hệ, môn học hoặc khoa.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mối quan hệ mới đã tồn tại.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseFacultyDto: UpdateCourseFacultyDto,
    @Res() res: Response,
  ) {
    const courseFaculty = await this.courseFacultyService.update(
      id,
      updateCourseFacultyDto,
    );
    return new SuccessResponse({
      data: courseFaculty,
      message: 'Cập nhật mối quan hệ môn học - khoa thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một mối quan hệ môn học - khoa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của mối quan hệ cần xóa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa mối quan hệ thành công.',
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
    description: 'Không tìm thấy mối quan hệ.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.courseFacultyService.remove(id);
    return new SuccessResponse({
      message: 'Xóa mối quan hệ môn học - khoa thành công',
    }).send(res);
  }
}
