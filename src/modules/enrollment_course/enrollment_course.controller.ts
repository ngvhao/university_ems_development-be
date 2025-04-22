import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { EnrollmentCourseService } from './enrollment_course.service';
import { Roles } from 'src/decorators/roles.decorator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { FilterEnrollmentCourseDto } from './dtos/filterEnrollmentCourse.dto';
import { UserEntity } from '../user/entities/user.entity';
import { StudentService } from '../student/student.service';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Enrollments')
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
@Controller('enrollments')
export class EnrollmentCourseController {
  constructor(
    private readonly enrollmentService: EnrollmentCourseService,
    private readonly studentService: StudentService,
  ) {}

  @Roles([
    EUserRole[EUserRole.STUDENT],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createDto: CreateEnrollmentCourseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user as UserEntity;
    const data = await this.enrollmentService.create(createDto, currentUser);
    return new SuccessResponse({
      data: data,
      message: 'Enrollment created successfully.',
    }).send(res);
  }

  // Chỉ Admin/Manager xem được tất cả hoặc lọc theo studentId/classGroupId
  // Student sẽ tự động bị lọc theo studentId của mình trong service nếu không phải admin/manager
  @Roles([
    EUserRole[EUserRole.STUDENT],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterEnrollmentCourseDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    // Logic kiểm tra quyền xem ID sinh viên khác (nếu có filter studentId)
    const { id: studentId } = await this.studentService.getOne({
      user: {
        id: currentUser.id,
      },
    });
    if (
      filterDto.studentId &&
      currentUser.role === EUserRole.STUDENT &&
      studentId !== filterDto.studentId
    ) {
      throw new ForbiddenException(
        'Students can only view their own enrollments.',
      );
    }
    if (
      filterDto.studentId &&
      !studentId &&
      currentUser.role === EUserRole.STUDENT
    ) {
      throw new ForbiddenException('User profile does not contain student ID.');
    }

    const { data, meta } = await this.enrollmentService.findAll(
      paginationDto,
      filterDto,
      currentUser,
    );
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Get all enrollments successfully.',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.STUDENT],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Get('/my')
  async findMyEnrollments(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterEnrollmentCourseDto, // Vẫn cho phép filter thêm status, classGroupId
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const { id: studentId } = await this.studentService.getOne({
      user: {
        id: currentUser.id,
      },
    });
    if (!studentId) {
      throw new ForbiddenException('User profile does not contain student ID.');
    }

    filterDto.studentId = studentId;
    const { data, meta } = await this.enrollmentService.findAll(
      paginationDto,
      filterDto,
      currentUser,
    );
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Get your enrollments successfully.',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.STUDENT],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user as UserEntity;
    const data = await this.enrollmentService.findOne(id, currentUser);
    return new SuccessResponse({
      data: data,
      message: 'Get enrollment successfully.',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.STUDENT],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user as UserEntity;
    const data = await this.enrollmentService.cancel(id, currentUser);
    return new SuccessResponse({
      data: data,
      message: 'Enrollment cancelled successfully.',
    }).send(res);
  }

  // Không nên có endpoint xóa cứng trừ khi có yêu cầu đặc biệt
  // @UseGuards(RolesGuard)
  // @Roles(EUserRole.ADMINISTRATOR) // Chỉ Admin mới được xóa cứng
  // @Delete(':id')
  // async remove(...) { ... }
}
