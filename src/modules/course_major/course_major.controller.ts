import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseMajorService } from './course_major.service';
import { CreateCourseMajorDto } from './dtos/createCourseMajor.dto';
import { UpdateCourseMajorDto } from './dtos/updateCourseMajor.dto';
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
import { CourseMajorEntity } from './entities/course_major.entity';

@ApiTags('Quản lý Môn học theo Ngành (Course Majors)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('course-majors')
export class CourseMajorController {
  constructor(private readonly courseMajorService: CourseMajorService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({
    summary: 'Tạo liên kết giữa Môn học và Ngành học',
  })
  @ApiBody({ type: CreateCourseMajorDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo liên kết thành công.',
    type: CourseMajorEntity,
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
    status: HttpStatus.CONFLICT,
    description: 'Liên kết giữa Môn học và Ngành học này đã tồn tại.',
  })
  async create(
    @Body() createCourseMajorDto: CreateCourseMajorDto,
    @Res() res: Response,
  ) {
    const courseMajor =
      await this.courseMajorService.create(createCourseMajorDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: courseMajor,
      message: 'Tạo liên kết Môn học-Ngành thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách liên kết Môn học-Ngành',
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách liên kết thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.courseMajorService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách liên kết Môn học-Ngành thành công',
    }).send(res);
  }

  @Get('/by-major/:majorId')
  @ApiOperation({
    summary: 'Lấy danh sách môn học theo ID Ngành',
  })
  @ApiParam({ name: 'majorId', type: Number, description: 'ID của Ngành học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách môn học thành công.',
    type: [CourseMajorEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Ngành học.',
  })
  async findByMajor(
    @Param('majorId', ParseIntPipe) majorId: number,
    @Res() res: Response,
  ) {
    const data = await this.courseMajorService.findByMajor(majorId);
    return new SuccessResponse({
      data,
      message: `Lấy danh sách môn học của Ngành ID ${majorId} thành công.`,
    }).send(res);
  }

  @Get('/by-course/:courseId')
  @ApiOperation({
    summary: 'Lấy danh sách ngành chứa môn học ',
  })
  @ApiParam({ name: 'courseId', type: Number, description: 'ID của Môn học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách ngành học thành công.',
    type: [CourseMajorEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Môn học.',
  })
  async findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Res() res: Response,
  ) {
    const data = await this.courseMajorService.findByCourse(courseId);
    return new SuccessResponse({
      data,
      message: `Lấy danh sách ngành chứa Môn học ID ${courseId} thành công.`,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết liên kết Môn học-Ngành ',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của liên kết CourseMajor',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin liên kết thành công.',
    type: CourseMajorEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy liên kết.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const courseMajor = await this.courseMajorService.findOne(id);
    return new SuccessResponse({
      data: courseMajor,
      message: 'Lấy thông tin liên kết Môn học-Ngành thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({
    summary: 'Cập nhật liên kết Môn học-Ngành ',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của liên kết cần cập nhật',
  })
  @ApiBody({ type: UpdateCourseMajorDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật liên kết thành công.',
    type: CourseMajorEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseMajorDto: UpdateCourseMajorDto,
    @Res() res: Response,
  ) {
    const courseMajor = await this.courseMajorService.update(
      id,
      updateCourseMajorDto,
    );
    return new SuccessResponse({
      data: courseMajor,
      message: 'Cập nhật liên kết Môn học-Ngành thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa một liên kết Môn học-Ngành' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa liên kết thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.courseMajorService.remove(id);
    return new SuccessResponse({
      message: 'Xóa liên kết Môn học-Ngành thành công',
    }).send(res);
  }
}
