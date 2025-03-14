import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentCourseService } from './enrollment_course.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateEnrollmentCourseDto } from './dtos/createEnrollmentCourse.dto';
import { UpdateEnrollmentCourseDto } from './dtos/updateEnrollmentCourse.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { ECourseStatus } from 'src/utils/enums/course.enum';

@ApiTags('enrollment-courses')
@UseGuards(JwtAuthGuard)
@Controller('enrollment-courses')
export class EnrollmentCourseController {
  constructor(
    private readonly enrollmentCourseService: EnrollmentCourseService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post('admin')
  @ApiOperation({ summary: 'Admin/Manager registers a student for a course' })
  @ApiBearerAuth()
  async createByAdmin(
    @Body() createEnrollmentCourseDto: CreateEnrollmentCourseDto,
  ) {
    return this.enrollmentCourseService.create(createEnrollmentCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles([EUserRole[EUserRole.STUDENT]])
  @Post('register')
  @ApiOperation({ summary: 'Student registers for a course semester' })
  @ApiBearerAuth()
  async registerCourse(
    @Body('courseSemesterId') courseSemesterId: number,
    @Request() req: RequestHasUserDto & Request,
  ) {
    const studentId = req.user.id;
    const createEnrollmentCourseDto: CreateEnrollmentCourseDto = {
      studentId,
      courseSemesterId,
      status: ECourseStatus.ENROLLED,
    };
    return this.enrollmentCourseService.create(createEnrollmentCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Get()
  @ApiOperation({ summary: 'Get all enrollment records (admin/manager only)' })
  @ApiBearerAuth()
  async findAll() {
    return this.enrollmentCourseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific enrollment record by ID' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: number) {
    return this.enrollmentCourseService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  @ApiOperation({ summary: 'Admin/Manager updates an enrollment record' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: number,
    @Body() updateEnrollmentCourseDto: UpdateEnrollmentCourseDto,
  ) {
    return this.enrollmentCourseService.update(id, updateEnrollmentCourseDto);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  @ApiOperation({ summary: 'Admin/Manager deletes an enrollment record' })
  @ApiBearerAuth()
  async remove(@Param('id') id: number) {
    return this.enrollmentCourseService.remove(id);
  }
}
