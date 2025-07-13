import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateMajorDto } from './dtos/createMajor.dto';
import { UpdateMajorDto } from './dtos/updateMajor.dto';
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
import { MajorEntity } from './entities/major.entity';
import { FilterMajorDto } from './dtos/filterMajor.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@ApiTags('Quản lý Ngành học (Majors)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một Ngành học mới' })
  @ApiBody({ type: CreateMajorDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo Ngành học thành công.',
    // type: MajorEntity,
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
    description: 'Không tìm thấy Khoa/Bộ môn.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên Ngành học đã tồn tại.',
  })
  async create(@Body() createMajorDto: CreateMajorDto, @Res() res: Response) {
    const major = await this.majorService.create(createMajorDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: major,
      message: 'Tạo Ngành học thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Ngành học (có phân trang và lọc)' })
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
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Lọc theo ID khoa',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: Number,
    description: 'Lọc theo ID bộ môn',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Lọc theo trạng thái',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterMajorDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.majorService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách Ngành học thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một Ngành học bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Ngành học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: MajorEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Ngành học.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const major = await this.majorService.findOne(id);
    return new SuccessResponse({
      data: major,
      message: 'Lấy thông tin Ngành học thành công',
    }).send(res);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin một Ngành học' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID Ngành học cần cập nhật',
  })
  @ApiBody({ type: UpdateMajorDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: MajorEntity,
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
    description: 'Không tìm thấy Ngành học hoặc Khoa/Bộ môn mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tên Ngành học mới đã tồn tại.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMajorDto: UpdateMajorDto,
    @Res() res: Response,
  ) {
    const major = await this.majorService.update(id, updateMajorDto);
    return new SuccessResponse({
      data: major,
      message: 'Cập nhật Ngành học thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa một Ngành học' })
  @ApiParam({ name: 'id', type: Number, description: 'ID Ngành học cần xóa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể xóa Ngành học do còn ràng buộc (Sinh viên, Lớp,...).',
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
    description: 'Không tìm thấy Ngành học.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.majorService.remove(id);
    return new SuccessResponse({
      message: 'Xóa Ngành học thành công',
    }).send(res);
  }
}
