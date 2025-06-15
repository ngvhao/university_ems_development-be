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
import { Response } from 'express';
import { SemesterService } from './semester.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSemesterDto } from './dtos/createSemester.dto';
import { UpdateSemesterDto } from './dtos/updateSemester.dto';
import { SuccessResponse } from 'src/utils/response';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SettingService } from '../setting/setting.service';

@ApiTags('Quản lý Học kỳ (Semesters)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('semesters')
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
    private readonly settingService: SettingService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo học kỳ mới' })
  @ApiBody({ type: CreateSemesterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Tạo học kỳ thành công. Dữ liệu trả về chứa thông tin học kỳ vừa tạo.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã học kỳ đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async create(
    @Body() createSemesterDto: CreateSemesterDto,
    @Res() res: Response,
  ) {
    const semester = await this.semesterService.create(createSemesterDto);
    return new SuccessResponse({
      data: semester,
      message: 'Tạo học kỳ thành công.',
    }).send(res);
  }

  @Get('currentSemester')
  async getCurrentSemester(@Res() res: Response) {
    const semesterId = await this.settingService.findOne('currentSemesterId');
    const semester = await this.semesterService.findOne(semesterId.value);
    return new SuccessResponse({
      data: semester,
      message: 'Lấy thông tin học kỳ thành công.',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách học kỳ (phân trang)' })
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
    description: 'Số lượng mục mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lấy danh sách học kỳ thành công. Dữ liệu trả về chứa danh sách học kỳ và các thông tin liên quan (khóa học, lịch đăng ký,...).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.semesterService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách học kỳ thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một học kỳ' })
  @ApiParam({ name: 'id', description: 'ID của học kỳ', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lấy thông tin học kỳ thành công. Dữ liệu trả về chứa thông tin chi tiết học kỳ và các thông tin liên quan.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học kỳ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const semester = await this.semesterService.findOne(id);
    return new SuccessResponse({
      data: semester,
      message: 'Lấy thông tin học kỳ thành công.',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin học kỳ' })
  @ApiParam({
    name: 'id',
    description: 'ID của học kỳ cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateSemesterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Cập nhật học kỳ thành công. Dữ liệu trả về chứa thông tin học kỳ sau khi cập nhật.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học kỳ.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Mã học kỳ đã được sử dụng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
    @Res() res: Response,
  ) {
    const semester = await this.semesterService.update(id, updateSemesterDto);
    return new SuccessResponse({
      data: semester,
      message: 'Cập nhật học kỳ thành công.',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa học kỳ' })
  @ApiParam({ name: 'id', description: 'ID của học kỳ cần xóa', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa học kỳ thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học kỳ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Không thể xóa học kỳ do có dữ liệu liên quan.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.semesterService.remove(id);
    return new SuccessResponse({
      message: 'Xóa học kỳ thành công.',
    }).send(res);
  }
}
