import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  Req,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateLecturerCourseDto } from './dto/createLecturerCourse.dto';
import { LecturerCourseService } from './lecturer_course.service';
import { RequestHasLecturerDto } from 'src/utils/request-has-lecturer-dto';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { LecturerInterceptor } from 'src/interceptors/get-lecturer.interceptor';
import { LecturerService } from '../lecturer/lecturer.service';

@ApiTags('Phân công Giảng dạy (Lecturer-Course)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lecturer-courses')
export class LecturerCourseController {
  constructor(
    private readonly lecturerCourseService: LecturerCourseService,
    private readonly lecturerService: LecturerService,
  ) {}

  @Post()
  @Roles([
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
    EUserRole.LECTURER,
  ])
  @ApiOperation({ summary: 'Phân công giảng viên dạy học phần' })
  @ApiBody({ type: CreateLecturerCourseDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phân công thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async assign(
    @Body() dto: CreateLecturerCourseDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    if (req.user.role == EUserRole.LECTURER) {
      const lecturer = await this.lecturerService.getOne({
        userId: req.user.id,
      });
      dto.lecturerId = lecturer.id;
    }
    const data = await this.lecturerCourseService.assign(dto);
    return new SuccessResponse({
      data,
      message: 'Phân công giảng viên dạy học phần thành công.',
    }).send(res);
  }

  @Get('/me')
  @Roles([EUserRole.LECTURER])
  @UseInterceptors(LecturerInterceptor)
  @ApiOperation({ summary: 'Lấy danh sách phân công giảng dạy' })
  @ApiQuery({ name: 'lecturerId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách phân công thành công.',
  })
  async findMyLecturerCourse(
    @Req() req: RequestHasLecturerDto & RequestHasUserDto & Request,
    @Query('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const lecturer = req.lecturer;
    const lecturerId = lecturer.id;
    const { data, meta } = await this.lecturerCourseService.findAll({
      lecturerId,
      courseId,
    });
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Lấy danh sách phân công thành công.',
    }).send(res);
  }

  @Get()
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Lấy danh sách phân công giảng dạy' })
  @ApiQuery({ name: 'lecturerId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách phân công thành công.',
  })
  async findAll(
    @Query('lecturerId') lecturerId: number,
    @Query('courseId') courseId: number,
    @Res() res: Response,
  ) {
    const data = await this.lecturerCourseService.findAll({
      lecturerId,
      courseId,
    });
    return new SuccessResponse({
      data,
      message: 'Lấy danh sách phân công thành công.',
    }).send(res);
  }

  @Patch(':id/cancel')
  @Roles([
    EUserRole.LECTURER,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
  ])
  @ApiOperation({ summary: 'Cập nhật phân công giảng dạy' })
  @ApiParam({
    name: 'id',
    description: 'ID của bản ghi phân công',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật phân công thành công.',
  })
  async update(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.lecturerCourseService.updateStatus(id, false);
    return new SuccessResponse({
      data,
      message: 'Cập nhật phân công thành công.',
    }).send(res);
  }

  @Delete(':id')
  @Roles([EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa phân công giảng dạy' })
  @ApiParam({
    name: 'id',
    description: 'ID của bản ghi phân công',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa phân công thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy phân công.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.lecturerCourseService.remove(id);
    return new SuccessResponse({
      message: 'Xóa phân công giảng viên thành công.',
    }).send(res);
  }
}
