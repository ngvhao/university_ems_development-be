import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Request, Response } from 'express';
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
import { StudentChatbotDataDto } from './dtos/studentChatbotData.dto';
import { RequestHasStudentDto } from 'src/utils/request-has-student-dto';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

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
    await this.studentService.createStudent(data);
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
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Lọc theo ID khoa',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: Number,
    description: 'Lọc theo ID bộ môn',
  })
  @ApiQuery({
    name: 'majorId',
    required: false,
    type: Number,
    description: 'Lọc theo ID ngành học',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: Number,
    description: 'Lọc theo ID lớp học',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Lọc theo trạng thái',
  })
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
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterStudentDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.studentService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      message: 'Lấy danh sách sinh viên thành công',
      data,
      metadata: meta,
    }).send(res);
  }
  @Get('chatbot-data')
  @Roles([EUserRole.STUDENT])
  @UseInterceptors(StudentInterceptor)
  @ApiOperation({
    summary: 'Lấy toàn bộ dữ liệu sinh viên cho chatbot',
    description:
      'API tổng hợp tất cả thông tin cần thiết của sinh viên: lịch học, lịch thi, học phí, thông báo, điểm số, v.v.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy dữ liệu chatbot thành công.',
    type: StudentChatbotDataDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên hoặc học kỳ hiện tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem thông tin sinh viên này.',
  })
  async getChatbotData(
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const chatbotData = await this.studentService.getChatbotData(
      req.student.id,
    );
    return new SuccessResponse({
      message: 'Lấy dữ liệu chatbot thành công',
      data: chatbotData,
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

  @Put(':id')
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
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Xóa sinh viên (bao gồm tài khoản user)' })
  @ApiParam({ name: 'id', description: 'ID của sinh viên cần xóa' })
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
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.studentService.remove(id);
    return new SuccessResponse({
      message: 'Xóa sinh viên thành công',
    }).send(res);
  }

  @Get(':id/gpa')
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Lấy thông tin GPA chi tiết của sinh viên' })
  @ApiParam({ name: 'id', description: 'ID của sinh viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin GPA chi tiết thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async getStudentGPADetails(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const gpaDetails = await this.studentService.getStudentGPADetails(id);
    return new SuccessResponse({
      data: gpaDetails,
      message: 'Lấy thông tin GPA chi tiết thành công.',
    }).send(res);
  }

  @Get(':studentId/course/:classGroupId/grades')
  @Roles([
    EUserRole.ADMINISTRATOR,
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.LECTURER,
    EUserRole.STUDENT,
  ])
  @ApiOperation({ summary: 'Lấy thông tin chi tiết điểm của một môn học' })
  @ApiParam({ name: 'studentId', description: 'ID của sinh viên' })
  @ApiParam({ name: 'classGroupId', description: 'ID của nhóm lớp' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin điểm chi tiết thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên hoặc đăng ký môn học.',
  })
  async getCourseGradeDetails(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('classGroupId', ParseIntPipe) classGroupId: number,
    @Res() res: Response,
  ) {
    const gradeDetails = await this.studentService.getCourseGradeDetails(
      studentId,
      classGroupId,
    );
    return new SuccessResponse({
      data: gradeDetails,
      message: 'Lấy thông tin điểm chi tiết thành công.',
    }).send(res);
  }

  @Post(':id/gpa/update')
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật GPA cho sinh viên cụ thể' })
  @ApiParam({ name: 'id', description: 'ID của sinh viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật GPA thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sinh viên.',
  })
  async updateStudentGPA(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.studentService.updateStudentGPA(id);
    return new SuccessResponse({
      message: 'Cập nhật GPA cho sinh viên thành công.',
    }).send(res);
  }

  @Post('gpa/update-all')
  @Roles([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER])
  @ApiOperation({ summary: 'Cập nhật GPA cho tất cả sinh viên' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật GPA cho tất cả sinh viên thành công',
  })
  async updateAllStudentsGPA(@Res() res: Response) {
    await this.studentService.updateAllStudentsGPA();
    return new SuccessResponse({
      message: 'Cập nhật GPA cho tất cả sinh viên thành công.',
    }).send(res);
  }
}
