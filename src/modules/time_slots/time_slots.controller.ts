import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { TimeSlotsService } from './time_slots.service';
import { CreateTimeSlotDto } from './dto/createTimeSlot.dto';
import { UpdateTimeSlotDto } from './dto/updateTimeSlot.dto';

@ApiTags('TimeSlots')
@UseGuards(JwtAuthGuard)
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotService: TimeSlotsService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createTimeSlotDto: CreateTimeSlotDto,
    @Res() res: Response,
  ) {
    const timeSlot = await this.timeSlotService.create(createTimeSlotDto);
    return new SuccessResponse({
      data: timeSlot,
      message: 'Create time slot successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.timeSlotService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all time slots successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const timeSlot = await this.timeSlotService.findOne(id);
    return new SuccessResponse({
      data: timeSlot,
      message: 'Get time slot successfully',
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
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
    @Res() res: Response,
  ) {
    const timeSlot = await this.timeSlotService.update(id, updateTimeSlotDto);
    return new SuccessResponse({
      data: timeSlot,
      message: 'Update time slot successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.timeSlotService.remove(id);
    return new SuccessResponse({
      message: 'Delete time slot successfully',
    }).send(res);
  }
}
