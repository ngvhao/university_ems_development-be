import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GradeDetailService } from './grade_detail.service';
import { CreateGradeDetailDto } from './dtos/createGradeDetail.dto';
import { UpdateGradeDetailDto } from './dtos/updateGradeDetail.dto';
import { FilterGradeDetailDto } from './dtos/filterGradeDetail.dto';
import { GradeDetailEntity } from './entities/grade_detail.entity';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { Response } from 'express';
import { SuccessResponse } from 'src/utils/response';

@ApiTags('Grade Details')
@Controller('grade-details')
export class GradeDetailController {
  constructor(private readonly gradeDetailService: GradeDetailService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo điểm chi tiết mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo điểm chi tiết thành công',
    type: GradeDetailEntity,
  })
  async create(
    @Body() createGradeDetailDto: CreateGradeDetailDto,
    @Res() res: Response,
  ) {
    const gradeDetail =
      await this.gradeDetailService.create(createGradeDetailDto);
    new SuccessResponse({
      data: gradeDetail,
      message: 'Tạo điểm chi tiết thành công.',
      statusCode: HttpStatus.CREATED,
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách điểm chi tiết (phân trang)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách điểm chi tiết thành công',
    type: [GradeDetailEntity],
  })
  async findAll(
    @Query() filterDto: FilterGradeDetailDto,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.gradeDetailService.findAll(
      filterDto,
      paginationDto,
    );
    new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách điểm chi tiết thành công.',
    }).send(res);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy điểm chi tiết theo sinh viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy điểm chi tiết theo sinh viên thành công',
    type: [GradeDetailEntity],
  })
  async findByStudent(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    const data = await this.gradeDetailService.findByStudent(+studentId);
    new SuccessResponse({
      data,
      message: 'Lấy điểm chi tiết theo sinh viên thành công.',
    }).send(res);
  }

  @Get('class-group/:classGroupId')
  @ApiOperation({ summary: 'Lấy điểm chi tiết theo nhóm lớp' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy điểm chi tiết theo nhóm lớp thành công',
    type: [GradeDetailEntity],
  })
  async findByClassGroup(
    @Param('classGroupId') classGroupId: string,
    @Res() res: Response,
  ) {
    const data = await this.gradeDetailService.findByClassGroup(+classGroupId);
    new SuccessResponse({
      data,
      message: 'Lấy điểm chi tiết theo nhóm lớp thành công.',
    }).send(res);
  }

  @Get('student/:studentId/class-group/:classGroupId')
  @ApiOperation({ summary: 'Lấy điểm chi tiết theo sinh viên và nhóm lớp' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy điểm chi tiết theo sinh viên và nhóm lớp thành công',
    type: [GradeDetailEntity],
  })
  async findByStudentAndClassGroup(
    @Param('studentId') studentId: string,
    @Param('classGroupId') classGroupId: string,
    @Res() res: Response,
  ) {
    const data = await this.gradeDetailService.findByStudentAndClassGroup(
      +studentId,
      +classGroupId,
    );
    new SuccessResponse({
      data,
      message: 'Lấy điểm chi tiết theo sinh viên và nhóm lớp thành công.',
    }).send(res);
  }

  @Get('weighted-average/student/:studentId/class-group/:classGroupId')
  @ApiOperation({
    summary: 'Tính điểm trung bình trọng số cho sinh viên trong nhóm lớp',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về điểm trung bình trọng số',
    type: Number,
  })
  async calculateWeightedAverage(
    @Param('studentId') studentId: string,
    @Param('classGroupId') classGroupId: string,
    @Res() res: Response,
  ) {
    const weightedAverage =
      await this.gradeDetailService.calculateWeightedAverage(
        +studentId,
        +classGroupId,
      );
    new SuccessResponse({
      data: weightedAverage,
      message: 'Tính điểm trung bình trọng số thành công.',
    }).send(res);
  }

  @Get('summary/student/:studentId/class-group/:classGroupId')
  @ApiOperation({
    summary: 'Tóm tắt điểm chi tiết cho sinh viên trong nhóm lớp',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Trả về tóm tắt điểm chi tiết và trung bình trọng số',
  })
  async getGradeSummary(
    @Param('studentId') studentId: string,
    @Param('classGroupId') classGroupId: string,
    @Res() res: Response,
  ) {
    const summary = await this.gradeDetailService.getGradeSummary(
      +studentId,
      +classGroupId,
    );
    new SuccessResponse({
      data: summary,
      message: 'Lấy tóm tắt điểm chi tiết thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy điểm chi tiết theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy điểm chi tiết theo ID thành công',
    type: GradeDetailEntity,
  })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const gradeDetail = await this.gradeDetailService.findOne(+id);
    new SuccessResponse({
      data: gradeDetail,
      message: 'Lấy điểm chi tiết theo ID thành công.',
    }).send(res);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật điểm chi tiết' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật điểm chi tiết thành công',
    type: GradeDetailEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() updateGradeDetailDto: UpdateGradeDetailDto,
    @Res() res: Response,
  ) {
    const gradeDetail = await this.gradeDetailService.update(
      +id,
      updateGradeDetailDto,
    );
    new SuccessResponse({
      data: gradeDetail,
      message: 'Cập nhật điểm chi tiết thành công.',
    }).send(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa điểm chi tiết' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa điểm chi tiết thành công',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.gradeDetailService.remove(+id);
    new SuccessResponse({
      message: 'Xóa điểm chi tiết thành công.',
    }).send(res);
  }
}
