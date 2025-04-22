import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateClassWeeklyScheduleDto } from './dtos/createClassWeeklySchedule.dto';
import { UpdateClassWeeklyScheduleDto } from './dtos/updateClassWeeklySchedule.dto';
import { StudentInterceptor } from 'src/interceptors/get-student.interceptor';
import { RequestHasStudentDto } from 'src/utils/request-has-student-dto';
import { ClassWeeklyScheduleService } from './class_weekly_schedule.service';

@ApiTags('ClassWeeklySchedules')
@UseGuards(JwtAuthGuard)
@Controller('class-weekly-schedules')
export class ClassWeeklyScheduleController {
  constructor(
    private readonly classWeeklyScheduleService: ClassWeeklyScheduleService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() dto: CreateClassWeeklyScheduleDto,
    @Res() res: Response,
  ) {
    const data = await this.classWeeklyScheduleService.create(dto);
    return new SuccessResponse({
      data,
      message: 'Create class weekly schedule successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } =
      await this.classWeeklyScheduleService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all class weekly schedules successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Get('student/:studentId')
  async getScheduleByStudentId(
    @Param('studentId') studentId: number,
    @Res() res: Response,
  ) {
    const data =
      await this.classWeeklyScheduleService.getScheduleByStudentId(studentId);
    return new SuccessResponse({
      data,
      message: 'Get student schedule successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([EUserRole[EUserRole.STUDENT]])
  @UseInterceptors(StudentInterceptor)
  @Get('student/my-schedule')
  async getMySchedule(
    @Req() req: RequestHasStudentDto & Request,
    @Res() res: Response,
  ) {
    const student = req.student;
    const data = await this.classWeeklyScheduleService.getScheduleByStudentId(
      student.id,
    );
    return new SuccessResponse({
      data,
      message: 'Get your schedule successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const data = await this.classWeeklyScheduleService.findOne(id);
    return new SuccessResponse({
      data,
      message: 'Get class weekly schedule successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateClassWeeklyScheduleDto,
    @Res() res: Response,
  ) {
    const data = await this.classWeeklyScheduleService.update(id, dto);
    return new SuccessResponse({
      data,
      message: 'Update class weekly schedule successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.classWeeklyScheduleService.remove(id);
    return new SuccessResponse({
      message: 'Delete class weekly schedule successfully',
    }).send(res);
  }
}
