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
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateFacultyDto } from './dtos/createFaculty.dto';
import { UpdateFacultyDto } from './dtos/updateFaculty.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createFacultyDto: CreateFacultyDto,
    @Res() res: Response,
  ) {
    const faculty = await this.facultyService.create(createFacultyDto);
    return new SuccessResponse({
      data: faculty,
      message: 'Faculty created',
    }).send(res);
  }

  @Get()
  async findAll(@Res() res: Response) {
    const faculties = await this.facultyService.findAll();
    return new SuccessResponse({
      data: faculties,
      message: 'Get all faculties successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const faculty = await this.facultyService.findOne(id);
    return new SuccessResponse({
      data: faculty,
      message: 'Get faculty successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
    @Res() res: Response,
  ) {
    const faculty = await this.facultyService.update(id, updateFacultyDto);
    return new SuccessResponse({
      data: faculty,
      message: 'Update faculty successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.facultyService.remove(id);
    return new SuccessResponse({
      message: 'Delete faculty successfully',
    }).send(res);
  }
}
