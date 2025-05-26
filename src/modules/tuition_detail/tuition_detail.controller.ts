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
import { TuitionDetailEntity } from './entities/tuition_detail.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTuitionDetailDto } from './dto/createTuitionDetail.dto';
import { UpdateTuitionDetailDto } from './dto/updateTutionDetail.dto';
import { TuitionDetailService } from './tuition_detail.service';

@ApiTags('Quản lý Chi tiết Học phí (Tuition Details)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('tuition-details')
export class TuitionDetailController {
  constructor(private readonly tuitionDetailService: TuitionDetailService) {}

  @Post('tuition-details')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo một chi tiết học phí mới' })
  @ApiBody({ type: CreateTuitionDetailDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo chi tiết học phí thành công.',
    type: TuitionDetailEntity,
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
    description: 'Không tìm thấy Học phí tổng hoặc Đăng ký môn học.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Chi tiết học phí cho mục này đã tồn tại.',
  })
  async create(
    @Body() createTuitionDetailDto: CreateTuitionDetailDto,
    @Res() res: Response,
  ) {
    const detail = await this.tuitionDetailService.create(
      createTuitionDetailDto,
    );
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: detail,
      message: 'Tạo chi tiết học phí thành công',
    }).send(res);
  }

  @Get('tuitions/:tuitionId/details')
  @ApiOperation({
    summary:
      'Lấy danh sách chi tiết học phí của một khoản học phí tổng (có phân trang)',
  })
  @ApiParam({
    name: 'tuitionId',
    type: Number,
    description: 'ID của khoản học phí tổng',
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
    description: 'Lấy danh sách chi tiết học phí thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy khoản học phí tổng.',
  })
  async findAllByTuitionId(
    @Param('tuitionId', ParseIntPipe) tuitionId: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.tuitionDetailService.findAllByTuitionId(
      tuitionId,
      paginationDto,
    );
    return new SuccessResponse({
      ...result,
      message: `Lấy danh sách chi tiết cho học phí ID ${tuitionId} thành công`,
    }).send(res);
  }

  @Get('tuition-details/:id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một mục học phí bằng ID của nó',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của chi tiết học phí',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin chi tiết học phí thành công.',
    type: TuitionDetailEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy chi tiết học phí.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const detail = await this.tuitionDetailService.findOne(id);
    return new SuccessResponse({
      data: detail,
      message: 'Lấy thông tin chi tiết học phí thành công',
    }).send(res);
  }

  @Patch('tuition-details/:id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật thông tin một chi tiết học phí' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID chi tiết học phí cần cập nhật',
  })
  @ApiBody({ type: UpdateTuitionDetailDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật chi tiết học phí thành công.',
    type: TuitionDetailEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ hoặc không thể thay đổi trường bị hạn chế.',
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
    description: 'Không tìm thấy chi tiết học phí.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTuitionDetailDto: UpdateTuitionDetailDto,
    @Res() res: Response,
  ) {
    const detail = await this.tuitionDetailService.update(
      id,
      updateTuitionDetailDto,
    );
    return new SuccessResponse({
      data: detail,
      message: 'Cập nhật chi tiết học phí thành công',
    }).send(res);
  }

  @Delete('tuition-details/:id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa một chi tiết học phí' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID chi tiết học phí cần xóa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa chi tiết học phí thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể xóa do ràng buộc (ví dụ: enrollmentId đã được sử dụng ở nơi khác không cho phép xóa).',
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
    description: 'Không tìm thấy chi tiết học phí.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.tuitionDetailService.remove(id);
    return new SuccessResponse({
      message: 'Xóa chi tiết học phí thành công',
    }).send(res);
  }
}
