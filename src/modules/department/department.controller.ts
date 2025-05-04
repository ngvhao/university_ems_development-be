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
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateDepartmentDto } from './dtos/createDepartment.dto';
import { UpdateDepartmentDto } from './dtos/updateDepartment.dto';
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
import { DepartmentEntity } from './entities/department.entity';

@ApiTags('Quản lý Bộ môn (Departments)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một Bộ môn mới' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo Bộ môn thành công.',
    // type: DepartmentEntity,
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
    description: 'Không tìm thấy Khoa (Faculty) trực thuộc.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã Bộ môn đã tồn tại.',
  })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.create(createDepartmentDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: department,
      message: 'Tạo Bộ môn thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Bộ môn (có phân trang)' })
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
    description: 'Lấy danh sách Bộ môn thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.departmentService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách Bộ môn thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một Bộ môn bằng ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của Bộ môn' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: DepartmentEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Bộ môn.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const department = await this.departmentService.findOne(id);
    return new SuccessResponse({
      data: department,
      message: 'Lấy thông tin Bộ môn thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một Bộ môn' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của Bộ môn cần cập nhật',
  })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: DepartmentEntity,
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
    description: 'Không tìm thấy Bộ môn hoặc Khoa (Faculty) mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã Bộ môn mới đã tồn tại.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.update(
      id,
      updateDepartmentDto,
    );
    return new SuccessResponse({
      data: department,
      message: 'Cập nhật Bộ môn thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một Bộ môn' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của Bộ môn cần xóa',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa Bộ môn do còn Giảng viên/Ngành học liên kết.',
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
    description: 'Không tìm thấy Bộ môn.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.departmentService.remove(id);
    return new SuccessResponse({
      message: 'Xóa Bộ môn thành công',
    }).send(res);
  }
}
