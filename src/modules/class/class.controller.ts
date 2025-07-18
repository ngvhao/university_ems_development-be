import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateClassDto } from './dtos/createClass.dto';
import { UpdateClassDto } from './dtos/updateClass.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SuccessResponse } from 'src/utils/response';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ClassEntity } from './entities/class.entity';
import { FilterClassDto } from './dtos/filterClass.dto';
import { StudentService } from '../student/student.service';

@ApiTags('Quản lý Lớp học (Classes)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly studentService: StudentService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo một lớp học mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo lớp học thành công.',
    type: ClassEntity,
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
    description: 'Không tìm thấy Ngành học hoặc Giảng viên.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã lớp đã tồn tại.',
  })
  async create(@Body() createClassDto: CreateClassDto, @Res() res: Response) {
    const classCreated = await this.classService.create(createClassDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Tạo lớp học thành công',
      data: classCreated,
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lớp học (có phân trang)' })
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
    description: 'Lấy danh sách lớp học thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterClassDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.classService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      message: 'Lấy danh sách lớp học thành công',
      data: data,
      metadata: meta,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một lớp học bằng ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin lớp học thành công.',
    type: ClassEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lớp học.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const classQueried = await this.classService.findOne(id);
    return new SuccessResponse({
      message: 'Lấy thông tin lớp học thành công',
      data: classQueried,
    }).send(res);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một lớp học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật lớp học thành công.',
    type: ClassEntity,
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
    description: 'Không tìm thấy lớp học, Ngành học hoặc Giảng viên.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã lớp đã tồn tại (nếu cập nhật mã).',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @Res() res: Response,
  ) {
    const updatedClass = await this.classService.update(id, updateClassDto);
    return new SuccessResponse({
      message: 'Cập nhật lớp học thành công',
      data: updatedClass,
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa một lớp học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa lớp học thành công.',
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
    description: 'Không tìm thấy lớp học.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classService.remove(id);
    return new SuccessResponse({
      message: 'Xóa lớp học thành công',
    }).send(res);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Lấy danh sách sinh viên của một lớp học' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách sinh viên của lớp học thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy lớp học.',
  })
  async getStudentsByClass(
    @Query() paginationDto: PaginationDto,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.studentService.findAll(paginationDto, {
      classId: id,
    });
    return new SuccessResponse({
      message: 'Lấy danh sách sinh viên của lớp học thành công',
      data,
      metadata: meta,
    }).send(res);
  }
}
