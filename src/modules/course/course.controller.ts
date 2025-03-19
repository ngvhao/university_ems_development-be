import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/createCourse.dto';
import { UpdateCourseDto } from './dtos/updateCourse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Res() res: Response) {
    const course = await this.courseService.create(createCourseDto);
    return new SuccessResponse({
      data: course,
      message: 'Create course succesfully',
    }).send(res);
  }

  @Get()
  async findAll(@Res() res: Response) {
    const courses = await this.courseService.findAll();
    return new SuccessResponse({
      data: courses,
      message: 'Get all courses successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const course = await this.courseService.findOne(id);
    return new SuccessResponse({
      data: course,
      message: 'Get course successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Res() res: Response,
  ) {
    const course = await this.courseService.update(id, updateCourseDto);
    return new SuccessResponse({
      data: course,
      message: 'Update course successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.courseService.remove(id);
    return new SuccessResponse({
      message: 'Delete course successfully',
    }).send(res);
  }
}
