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
import { MajorService } from './major.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateMajorDto } from './dtos/createMajor.dto';
import { UpdateMajorDto } from './dtos/updateMajor.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(@Body() createMajorDto: CreateMajorDto, @Res() res: Response) {
    const major = await this.majorService.create(createMajorDto);
    return new SuccessResponse({
      data: major,
      message: 'Major created',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.majorService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all majors successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const major = await this.majorService.findOne(id);
    return new SuccessResponse({
      data: major,
      message: 'Get major successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMajorDto: UpdateMajorDto,
    @Res() res: Response,
  ) {
    const major = await this.majorService.update(id, updateMajorDto);
    return new SuccessResponse({
      data: major,
      message: 'Update major successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.majorService.remove(id);
    return new SuccessResponse({
      message: 'Delete major successfully',
    }).send(res);
  }
}
