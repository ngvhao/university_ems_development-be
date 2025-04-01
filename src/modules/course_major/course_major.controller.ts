import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CourseMajorService } from './course_major.service';
import { CreateCourseMajorDto } from './dtos/createCourseMajor.dto';
import { UpdateCourseMajorDto } from './dtos/updateCourseMajor.dto';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('course-majors')
export class CourseMajorController {
  constructor(private readonly courseMajorService: CourseMajorService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
  ])
  @Post()
  async create(
    @Body() createCourseMajorDto: CreateCourseMajorDto,
    @Res() res: Response,
  ) {
    const courseMajor =
      await this.courseMajorService.create(createCourseMajorDto);
    return new SuccessResponse({
      data: courseMajor,
      message: 'Create course major successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const data = await this.courseMajorService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      message: 'Get all course majors successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const courseMajor = await this.courseMajorService.findOne(id);
    return new SuccessResponse({
      data: courseMajor,
      message: 'Get course major successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCourseMajorDto: UpdateCourseMajorDto,
    @Res() res: Response,
  ) {
    const courseMajor = await this.courseMajorService.update(
      id,
      updateCourseMajorDto,
    );
    return new SuccessResponse({
      data: courseMajor,
      message: 'Update course major successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.courseMajorService.remove(id);
    return new SuccessResponse({
      message: 'Delete course major successfully',
    }).send(res);
  }
}
