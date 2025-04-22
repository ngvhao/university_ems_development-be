import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassAdjustmentScheduleService } from './class_adjustment_schedule.service';
import { Response } from 'express';
import { SuccessResponse } from 'src/utils/response';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateAdjustmentScheduleDto } from './dto/createClassAdjustmentSchedule.dto';
import { UpdateAdjustmentScheduleDto } from './dto/updateClassAdjustmentSchedule.dto';

@ApiTags('ClassAdjustmentSchedules')
@UseGuards(JwtAuthGuard)
@Controller('class-adjustment-schedules')
export class ClassAdjustmentScheduleController {
  constructor(
    private readonly classAdjustmentService: ClassAdjustmentScheduleService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(@Body() dto: CreateAdjustmentScheduleDto, @Res() res: Response) {
    const schedule = await this.classAdjustmentService.create(dto);
    return new SuccessResponse({
      data: schedule,
      message: 'Create class adjustment schedule successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } =
      await this.classAdjustmentService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all adjustment schedules successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const schedule = await this.classAdjustmentService.findOne(id);
    return new SuccessResponse({
      data: schedule,
      message: 'Get adjustment schedule successfully',
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
    @Body() dto: UpdateAdjustmentScheduleDto,
    @Res() res: Response,
  ) {
    const schedule = await this.classAdjustmentService.update(id, dto);
    return new SuccessResponse({
      data: schedule,
      message: 'Update adjustment schedule successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.classAdjustmentService.remove(id);
    return new SuccessResponse({
      message: 'Delete adjustment schedule successfully',
    }).send(res);
  }
}
