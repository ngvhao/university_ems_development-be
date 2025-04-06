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
import { CreateLecturerDto } from './dtos/createLecturer.dto';
import { UpdateLecturerDto } from './dtos/updateLecturer.dto';
import { LecturerService } from './lecturer.service';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('lecturers')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createLecturerDto: CreateLecturerDto,
    @Res() res: Response,
  ) {
    const lecturer = await this.lecturerService.create(createLecturerDto);
    return new SuccessResponse({
      data: lecturer,
      message: 'Create lecturer successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.lecturerService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all lecturers successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const lecturer = await this.lecturerService.findOne(id);
    return new SuccessResponse({
      data: lecturer,
      message: 'Get lecturer successfully',
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
    @Body() updateLecturerDto: UpdateLecturerDto,
    @Res() res: Response,
  ) {
    const lecturer = await this.lecturerService.update(id, updateLecturerDto);
    return new SuccessResponse({
      data: lecturer,
      message: 'Update lecturer successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.lecturerService.remove(id);
    return new SuccessResponse({
      message: 'Delete lecturer successfully',
    }).send(res);
  }
}
