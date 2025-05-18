import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Response } from 'express';
import { CreateStudentDto } from './dtos/createStudent.dto';
import { SuccessResponse } from 'src/utils/response';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterStudentDto } from './dtos/filterStudent.dto';
import { UpdateStudentDto } from './dtos/updateStudent.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';

@ApiTags('Sinh viên (Students)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Tạo sinh viên mới (bao gồm tài khoản user)' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Tạo sinh viên thành công. Dữ liệu trả về là thông tin user (không có password).',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ (thiếu thông tin, lớp không hợp lệ,...).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Lớp học.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email hoặc mã sinh viên/user code đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền tạo sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async createStudent(@Body() data: CreateStudentDto, @Res() res: Response) {
    console.log('createStudent@@@sendMessageToQueue');
    // await this.studentService.testQueue(data);
    return new SuccessResponse({
      message: 'Tạo sinh viên thành công',
      statusCode: HttpStatus.CREATED,
      data: null,
    }).send(res);
  }

  @Get()
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.LECTURER,
  ])
  @ApiOperation({ summary: 'Lấy danh sách sinh viên (phân trang và lọc)' })
  @ApiQuery({ type: FilterStudentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lấy danh sách sinh viên thành công. Dữ liệu user không chứa password.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem danh sách sinh viên.',
  })
  async findAll(@Query() filterDto: FilterStudentDto, @Res() res: Response) {
    const { data, meta } = await this.studentService.findAll(filterDto);
    return new SuccessResponse({
      message: 'Lấy danh sách sinh viên thành công',
      data,
      metadata: meta,
    }).send(res);
  }

  @Get(':id')
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một sinh viên' })
  @ApiParam({
    name: 'id',
    description: 'ID của Sinh viên (không phải User ID)',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lấy thông tin sinh viên thành công. Dữ liệu user không chứa password.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem thông tin sinh viên này.',
  })
  async findOne(
    @Req() req: RequestHasUserDto & Request,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (user.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.getOne({
        userId: user.id,
      });
      if (!studentProfile || studentProfile.id !== id) {
        throw new ForbiddenException(
          'Bạn không có quyền xem thông tin sinh viên này.',
        );
      }
    }
    const student = await this.studentService.findOneById(id);
    return new SuccessResponse({
      message: 'Lấy thông tin sinh viên thành công',
      data: student,
    }).send(res);
  }

  @Patch(':id')
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên' })
  @ApiParam({
    name: 'id',
    description: 'ID của Sinh viên cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin sinh viên thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên hoặc lớp mới.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc lớp mới không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email cập nhật bị trùng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền cập nhật sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async update(
    @Req() req: RequestHasUserDto & Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStudentDto,
    @Res() res: Response,
  ) {
    const user = req.user;
    if (user.role === EUserRole.STUDENT) {
      const studentProfile = await this.studentService.getOne({
        userId: user.id,
      });
      if (!studentProfile || studentProfile.id !== id) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật thông tin sinh viên này.',
        );
      }
    }
    const updatedStudent = await this.studentService.update(id, updateDto);
    return new SuccessResponse({
      message: 'Cập nhật thông tin sinh viên thành công',
      data: updatedStudent,
    }).send(res);
  }

  @Delete(':id')
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa sinh viên (bao gồm tài khoản user)' })
  @ApiParam({
    name: 'id',
    description: 'ID của Sinh viên cần xóa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa sinh viên thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xóa sinh viên.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.studentService.remove(id);
    return new SuccessResponse({
      message: 'Xóa sinh viên thành công.',
    }).send(res);
  }
}
