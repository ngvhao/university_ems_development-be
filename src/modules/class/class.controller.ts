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
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateClassDto } from './dtos/createClass.dto';
import { UpdateClassDto } from './dtos/updateClass.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@ApiTags('Classes')
@UseGuards(JwtAuthGuard)
@Controller('classes')
@ApiBearerAuth('token')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(@Body() createClassDto: CreateClassDto, @Res() res: Response) {
    const classCreated = await this.classService.create(createClassDto);
    return new SuccessResponse({
      data: classCreated,
      message: 'Class created',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.classService.findAll(paginationDto);
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Get all courses successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const classQueried = await this.classService.findOne(id);
    return new SuccessResponse({
      data: classQueried,
      message: 'Get class successfully',
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
    @Body() updateClassDto: UpdateClassDto,
    @Res() res: Response,
  ) {
    const updatedClass = await this.classService.update(id, updateClassDto);
    return new SuccessResponse({
      data: updatedClass,
      message: 'Update class successfuly',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.classService.remove(id);
    return new SuccessResponse({
      message: 'Remove class successfully',
    }).send(res);
  }
}
