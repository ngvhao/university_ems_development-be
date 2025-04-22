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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CurriculumCourseService } from './curriculum_course.service';
import { CreateCurriculumCourseDto } from './dtos/createCurriculumCourse.dto';
import { UpdateCurriculumCourseDto } from './dtos/updateCurriculumCourse.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CurriculumCourses')
@UseGuards(JwtAuthGuard)
@Controller('curriculum-courses')
export class CurriculumCourseController {
  constructor(
    private readonly curriculumCourseService: CurriculumCourseService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createCurriculumCourseDto: CreateCurriculumCourseDto,
    @Res() res: Response,
  ) {
    const curriculumCourse = await this.curriculumCourseService.create(
      createCurriculumCourseDto,
    );
    return new SuccessResponse({
      data: curriculumCourse,
      message: 'Create curriculum course successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } =
      await this.curriculumCourseService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all curriculum courses successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const curriculumCourse = await this.curriculumCourseService.findOne(id);
    return new SuccessResponse({
      data: curriculumCourse,
      message: 'Get curriculum course successfully',
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
    @Body() updateCurriculumCourseDto: UpdateCurriculumCourseDto,
    @Res() res: Response,
  ) {
    const curriculumCourse = await this.curriculumCourseService.update(
      id,
      updateCurriculumCourseDto,
    );
    return new SuccessResponse({
      data: curriculumCourse,
      message: 'Update curriculum course successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.curriculumCourseService.remove(id);
    return new SuccessResponse({
      message: 'Delete curriculum course successfully',
    }).send(res);
  }
}
