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
import { TuitionService } from './tuition.service';
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
import { TuitionEntity } from './entities/tuition.entity';
import { CreateTuitionDto } from './dto/createTuition.dto';
import { UpdateTuitionDto } from './dto/updateTuition.dto';
import { PaymentProcessDto } from './dto/processPayment.dto';

@ApiTags('Quản lý Học phí (Tuitions)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tuitions')
export class TuitionController {
  constructor(private readonly tuitionService: TuitionService) {}

  @Post('/processPayment')
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.STUDENT])
  async processPayment(
    @Body() processPaymentDto: PaymentProcessDto,
    @Res() res: Response,
  ) {
    const result = await this.tuitionService.processPayment(processPaymentDto);
    return new SuccessResponse({
      data: result,
      message: `Url callback payment gateway`,
    }).send(res);
  }

  @Post()
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một bản ghi học phí mới' })
  @ApiBody({ type: CreateTuitionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo học phí thành công.',
    type: TuitionEntity,
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
    description: 'Không tìm thấy Sinh viên hoặc Học kỳ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Học phí cho sinh viên và học kỳ này đã tồn tại.',
  })
  async create(
    @Body() createTuitionDto: CreateTuitionDto,
    @Res() res: Response,
  ) {
    const tuition = await this.tuitionService.create(createTuitionDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: tuition,
      message: 'Tạo học phí thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách học phí (có phân trang và tìm kiếm)',
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
    name: 'search',
    required: false,
    type: String,
    description:
      'Từ khóa tìm kiếm (tên SV, mã SV, tên học kỳ, số tiền, trạng thái)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách học phí thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.tuitionService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách học phí thành công',
    }).send(res);
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Lấy danh sách học phí của một sinh viên (có phân trang)',
  })
  @ApiParam({
    name: 'studentId',
    type: Number,
    description: 'ID của Sinh viên',
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
    description: 'Lấy danh sách học phí của sinh viên thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async getTuitionsByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.tuitionService.getTuitionsByStudent(
      studentId,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: `Lấy danh sách học phí cho sinh viên ID ${studentId} thành công`,
    }).send(res);
  }

  @Get('semester/:semesterId')
  @ApiOperation({
    summary: 'Lấy danh sách học phí theo một học kỳ (có phân trang)',
  })
  @ApiParam({ name: 'semesterId', type: Number, description: 'ID của Học kỳ' })
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
    description: 'Lấy danh sách học phí theo học kỳ thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học kỳ.',
  })
  async getTuitionsBySemester(
    @Param('semesterId', ParseIntPipe) semesterId: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.tuitionService.getTuitionsBySemester(
      semesterId,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: `Lấy danh sách học phí cho học kỳ ID ${semesterId} thành công`,
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một bản ghi học phí bằng ID',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID của bản ghi học phí' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin học phí thành công.',
    type: TuitionEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy học phí.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const tuition = await this.tuitionService.findOne(id);
    return new SuccessResponse({
      data: tuition,
      message: 'Lấy thông tin học phí thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin một bản ghi học phí' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID học phí cần cập nhật',
  })
  @ApiBody({ type: UpdateTuitionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật học phí thành công.',
    type: TuitionEntity,
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
    description:
      'Không tìm thấy học phí, hoặc Sinh viên/Học kỳ mới không tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Xung đột dữ liệu học phí (ví dụ: cặp Sinh viên - Học kỳ mới đã tồn tại).',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTuitionDto: UpdateTuitionDto,
    @Res() res: Response,
  ) {
    const tuition = await this.tuitionService.update(id, updateTuitionDto);
    return new SuccessResponse({
      data: tuition,
      message: 'Cập nhật học phí thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một bản ghi học phí' })
  @ApiParam({ name: 'id', type: Number, description: 'ID học phí cần xóa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa học phí thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể xóa học phí do có ràng buộc (ví dụ: đã có giao dịch thanh toán).',
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
    description: 'Không tìm thấy học phí.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.tuitionService.remove(id);
    return new SuccessResponse({
      message: 'Xóa học phí thành công',
    }).send(res);
  }
}
