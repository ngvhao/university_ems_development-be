import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/createCourse.dto';
import { UpdateCourseDto } from './dtos/updateCourse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';

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
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.courseService.findOne(id);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.courseService.remove(id);
  }
}
