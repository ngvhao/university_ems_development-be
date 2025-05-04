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
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dtos/createCurriculum.dto';
import { UpdateCurriculumDto } from './dtos/updateCurriculum.dto';
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
import { CurriculumEntity } from './entities/curriculum.entity';

@ApiTags('Quản lý Chương trình Đào tạo (Curriculums)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('curriculums')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một chương trình đào tạo mới' })
  @ApiBody({ type: CreateCurriculumDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo chương trình đào tạo thành công.',
    type: CurriculumEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc vi phạm logic nghiệp vụ.',
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
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Chương trình đào tạo bị trùng lặp (ví dụ: cùng ngành, năm học).',
  })
  async create(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @Res() res: Response,
  ) {
    const curriculum = await this.curriculumService.create(createCurriculumDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: curriculum,
      message: 'Tạo chương trình đào tạo thành công',
    }).send(res);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách chương trình đào tạo (có phân trang)',
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
    description: 'Lấy danh sách chương trình đào tạo thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const result = await this.curriculumService.findAll(paginationDto);
    return new SuccessResponse({
      ...result,
      message: 'Lấy danh sách chương trình đào tạo thành công',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một chương trình đào tạo bằng ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của chương trình đào tạo',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin thành công.',
    type: CurriculumEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy chương trình đào tạo.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const curriculum = await this.curriculumService.findOne(id);
    return new SuccessResponse({
      data: curriculum,
      message: 'Lấy thông tin chương trình đào tạo thành công',
    }).send(res);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một chương trình đào tạo' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của CTĐT cần cập nhật',
  })
  @ApiBody({ type: UpdateCurriculumDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công.',
    type: CurriculumEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc vi phạm logic nghiệp vụ.',
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
    description: 'Không tìm thấy CTĐT hoặc Ngành học mới.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Chương trình đào tạo cập nhật bị trùng lặp.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
    @Res() res: Response,
  ) {
    const curriculum = await this.curriculumService.update(
      id,
      updateCurriculumDto,
    );
    return new SuccessResponse({
      data: curriculum,
      message: 'Cập nhật chương trình đào tạo thành công',
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một chương trình đào tạo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của CTĐT cần xóa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thành công.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa do còn môn học trong chương trình.',
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
    description: 'Không tìm thấy CTĐT.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.curriculumService.remove(id);
    return new SuccessResponse({
      message: 'Xóa chương trình đào tạo thành công',
    }).send(res);
  }
}
