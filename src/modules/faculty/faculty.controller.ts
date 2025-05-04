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
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateFacultyDto } from './dtos/createFaculty.dto';
import { UpdateFacultyDto } from './dtos/updateFaculty.dto';
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
import { FacultyEntity } from './entities/faculty.entity';

@ApiTags('Quản lý Khoa (Faculties)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một Khoa mới' })
  @ApiBody({ type: CreateFacultyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo Khoa thành công.',
    // type: FacultyEntity,
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
    status: HttpStatus.CONFLICT,
    description: 'Mã Khoa đã tồn tại.',
  })
  async create(
    @Body() createFacultyDto: CreateFacultyDto,
    @Res() res: Response,
  ) {
    const faculty = await this.facultyService.create(createFacultyDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: faculty,
      message: 'Tạo Khoa thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Khoa (có phân trang)' })
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
    description: 'Lấy danh sách Khoa thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.facultyService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách Khoa thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một Khoa bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Khoa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: FacultyEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Khoa.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const faculty = await this.facultyService.findOne(id);
    return new SuccessResponse({
      data: faculty,
      message: 'Lấy thông tin Khoa thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một Khoa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của Khoa cần cập nhật',
  })
  @ApiBody({ type: UpdateFacultyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: FacultyEntity,
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
    description: 'Không tìm thấy Khoa.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã Khoa mới đã tồn tại.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
    @Res() res: Response,
  ) {
    const faculty = await this.facultyService.update(id, updateFacultyDto);
    return new SuccessResponse({
      data: faculty,
      message: 'Cập nhật Khoa thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một Khoa' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Khoa cần xóa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa Khoa do còn Khoa/Bộ môn trực thuộc.',
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
    description: 'Không tìm thấy Khoa.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.facultyService.remove(id);
    return new SuccessResponse({
      message: 'Xóa Khoa thành công',
    }).send(res);
  }
}
