// src/modules/semester/semester.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SemesterService } from './semester.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSemesterDto } from './dtos/createSemester.dto';
import { UpdateSemesterDto } from './dtos/updateSemester.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Semesters')
@UseGuards(JwtAuthGuard)
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createSemesterDto: CreateSemesterDto,
    @Res() res: Response,
  ) {
    const semester = await this.semesterService.create(createSemesterDto);
    return new SuccessResponse({
      data: semester,
      message: 'Semester created',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.semesterService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all semesters successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const semester = await this.semesterService.findOne(id);
    return new SuccessResponse({
      data: semester,
      message: 'Get semester successfully',
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
    @Body() updateSemesterDto: UpdateSemesterDto,
    @Res() res: Response,
  ) {
    const semester = await this.semesterService.update(id, updateSemesterDto);
    return new SuccessResponse({
      data: semester,
      message: 'Update semester successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.semesterService.remove(id);
    return new SuccessResponse({
      message: 'Delete semester successfully',
    }).send(res);
  }
}
