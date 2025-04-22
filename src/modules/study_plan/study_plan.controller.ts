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
import { StudyPlanService } from './study_plan.service';
import { CreateStudyPlanDto } from './dtos/createStudyPlan.dto';
import { UpdateStudyPlanDto } from './dtos/updateStudyPlan.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('StudyPlans')
@UseGuards(JwtAuthGuard)
@Controller('study-plans')
export class StudyPlanController {
  constructor(private readonly studyPlanService: StudyPlanService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createStudyPlanDto: CreateStudyPlanDto,
    @Res() res: Response,
  ) {
    const studyPlan = await this.studyPlanService.create(createStudyPlanDto);
    return new SuccessResponse({
      data: studyPlan,
      message: 'Create study plan successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.studyPlanService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all study plans successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const studyPlan = await this.studyPlanService.findOne(id);
    return new SuccessResponse({
      data: studyPlan,
      message: 'Get study plan successfully',
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
    @Body() updateStudyPlanDto: UpdateStudyPlanDto,
    @Res() res: Response,
  ) {
    const studyPlan = await this.studyPlanService.update(
      id,
      updateStudyPlanDto,
    );
    return new SuccessResponse({
      data: studyPlan,
      message: 'Update study plan successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.studyPlanService.remove(id);
    return new SuccessResponse({
      message: 'Delete study plan successfully',
    }).send(res);
  }
}
