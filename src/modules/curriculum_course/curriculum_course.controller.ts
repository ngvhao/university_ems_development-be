// src/modules/curriculum_course/curriculum_course.controller.ts
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CurriculumCourseService } from './curriculum_course.service';
import { CreateCurriculumCourseDto } from './dtos/createCurriculumCourse.dto';
import { UpdateCurriculumCourseDto } from './dtos/updateCurriculumCourse.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
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
import { CurriculumCourseEntity } from './entities/curriculum_course.entity';

@ApiTags('Quản lý Môn học trong CTĐT (Curriculum Courses)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('curriculum-courses')
export class CurriculumCourseController {
  constructor(
    private readonly curriculumCourseService: CurriculumCourseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Thêm môn học vào CTĐT (có thể kèm tiên quyết theo CTĐT)',
  })
  @ApiBody({ type: CreateCurriculumCourseDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Thêm môn học thành công.',
    type: CurriculumCourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ (VD: tiên quyết không thuộc CTĐT).',
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
    description: 'Không tìm thấy CTĐT, Môn học, Học kỳ hoặc Môn tiên quyết.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Môn học đã tồn tại trong CTĐT này.',
  })
  async create(
    @Body() createCurriculumCourseDto: CreateCurriculumCourseDto,
    @Res() res: Response,
  ) {
    const curriculumCourse = await this.curriculumCourseService.create(
      createCurriculumCourseDto,
    );
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: curriculumCourse,
      message: 'Thêm môn học vào chương trình đào tạo thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách môn học trong các CTĐT (kèm tiên quyết theo CTĐT)',
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
    name: 'curriculumId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Chương trình đào tạo',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Môn học',
  })
  @ApiQuery({
    name: 'semesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Học kỳ gợi ý',
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
    const result = await this.curriculumCourseService.findAll(paginationDto);
    return new SuccessResponse({
      data: result.data,
      metadata: result.meta,
      message: 'Lấy danh sách môn học trong CTĐT thành công',
    }).send(res);
  }

  @Get('/by-curriculum/:curriculumId')
  @ApiOperation({
    summary: 'Lấy danh sách môn học theo ID CTĐT (kèm tiên quyết theo CTĐT)',
  })
  @ApiParam({
    name: 'curriculumId',
    type: Number,
    description: 'ID của Chương trình đào tạo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách môn học thành công.',
    type: [CurriculumCourseEntity],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Chương trình đào tạo.',
  })
  async findByCurriculum(
    @Param('curriculumId', ParseIntPipe) curriculumId: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.curriculumCourseService.findByCurriculum(
      curriculumId,
      paginationDto,
    );
    return new SuccessResponse({
      data: result.data,
      metadata: result.meta,
      message: `Lấy danh sách môn học của CTĐT ID ${curriculumId} thành công.`,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết môn học trong CTĐT (kèm tiên quyết theo CTĐT)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của liên kết CurriculumCourse',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: CurriculumCourseEntity,
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
    const curriculumCourse = await this.curriculumCourseService.findOne(id);
    return new SuccessResponse({
      data: curriculumCourse,
      message: 'Lấy thông tin môn học trong CTĐT thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary:
      'Cập nhật môn học trong CTĐT (isMandatory, semesterId, minGrade, prerequisite)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của liên kết CurriculumCourse cần cập nhật',
  })
  @ApiBody({ type: UpdateCurriculumCourseDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: CurriculumCourseEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ (VD: tiên quyết mới không thuộc CTĐT).',
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
    description: 'Không tìm thấy liên kết hoặc Học kỳ/Tiên quyết mới.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCurriculumCourseDto: UpdateCurriculumCourseDto,
    @Res() res: Response,
  ) {
    const curriculumCourse = await this.curriculumCourseService.update(
      id,
      updateCurriculumCourseDto,
    );
    return new SuccessResponse({
      data: curriculumCourse,
      message: 'Cập nhật môn học trong CTĐT thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một môn học khỏi chương trình đào tạo' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của liên kết CurriculumCourse cần xóa',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa vì đang là tiên quyết cho môn khác trong CTĐT.',
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
    description: 'Không tìm thấy liên kết.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.curriculumCourseService.remove(id);
    return new SuccessResponse({
      message: 'Xóa môn học khỏi chương trình đào tạo thành công',
    }).send(res);
  }
}
