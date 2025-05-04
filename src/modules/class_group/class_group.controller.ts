import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ClassGroupService } from './class_group.service';
import { Roles } from 'src/decorators/roles.decorator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateClassGroupDto } from './dtos/createClassGroup.dto';
import { FilterClassGroupDto } from './dtos/filterClassGroup.dto';
import { UpdateClassGroupDto } from './dtos/updateClassGroup.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateClassGroupStatusDto } from './dtos/updateClassGroupStatus.dto';
import { ClassGroupEntity } from './entities/class_group.entity';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

@ApiTags('Quản lý Nhóm lớp học (Class Groups)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('class-groups')
export class ClassGroupController {
  constructor(private readonly classGroupService: ClassGroupService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một nhóm lớp mới' })
  @ApiBody({ type: CreateClassGroupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc không thể tạo nhóm.',
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
    description: 'Không tìm thấy Học phần-Học kỳ tương ứng.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số thứ tự nhóm đã tồn tại trong học phần-học kỳ này.',
  })
  async create(@Body() createDto: CreateClassGroupDto, @Res() res: Response) {
    const data = await this.classGroupService.create(createDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: data,
      message: 'Tạo nhóm lớp thành công.',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhóm lớp (có phân trang và lọc)' })
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
    name: 'courseSemesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID Học phần-Học kỳ',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EClassGroupStatus,
    description: 'Lọc theo trạng thái nhóm',
  })
  @ApiQuery({
    name: 'groupNumber',
    required: false,
    type: Number,
    description: 'Lọc theo số thứ tự nhóm',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách nhóm lớp thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterClassGroupDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.classGroupService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Lấy danh sách nhóm lớp thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một nhóm lớp bằng ID' })
  @ApiParam({ name: 'id', description: 'ID của nhóm lớp', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm lớp.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.classGroupService.findOne(id);
    return new SuccessResponse({
      data: data,
      message: 'Lấy thông tin nhóm lớp thành công.',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateClassGroupDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ hoặc vi phạm logic (VD: maxStudents < registeredStudents).',
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
    description: 'Không tìm thấy nhóm lớp.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số thứ tự nhóm mới bị trùng.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassGroupDto,
    @Res() res: Response,
  ) {
    const data = await this.classGroupService.update(id, updateDto);
    return new SuccessResponse({
      data: data,
      message: 'Cập nhật nhóm lớp thành công.',
    }).send(res);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật trạng thái của một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần cập nhật trạng thái',
    type: Number,
  })
  @ApiBody({ type: UpdateClassGroupStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu trạng thái không hợp lệ.',
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
    description: 'Không tìm thấy nhóm lớp.',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateClassGroupStatusDto,
    @Res() res: Response,
  ) {
    const data = await this.classGroupService.updateStatus(
      id,
      updateStatusDto.status,
    );
    return new SuccessResponse({
      data: data,
      message: `Cập nhật trạng thái nhóm lớp thành công thành '${updateStatusDto.status}'.`,
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần xóa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa nhóm lớp thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa nhóm lớp (VD: đã có sinh viên đăng ký).',
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
    description: 'Không tìm thấy nhóm lớp.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classGroupService.remove(id);
    return new SuccessResponse({
      message: 'Xóa nhóm lớp thành công.',
    }).send(res);
  }
}
