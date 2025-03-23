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
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dtos/createCurriculum.dto';
import { UpdateCurriculumDto } from './dtos/updateCurriculum.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('curriculums')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @Res() res: Response,
  ) {
    const curriculum = await this.curriculumService.create(createCurriculumDto);
    return new SuccessResponse({
      data: curriculum,
      message: 'Create curriculum successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.curriculumService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all curriculums successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const curriculum = await this.curriculumService.findOne(id);
    return new SuccessResponse({
      data: curriculum,
      message: 'Get curriculum successfully',
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
    @Body() updateCurriculumDto: UpdateCurriculumDto,
    @Res() res: Response,
  ) {
    const curriculum = await this.curriculumService.update(
      id,
      updateCurriculumDto,
    );
    return new SuccessResponse({
      data: curriculum,
      message: 'Update curriculum successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.curriculumService.remove(id);
    return new SuccessResponse({
      message: 'Delete curriculum successfully',
    }).send(res);
  }
}
