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
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateDepartmentDto } from './dtos/createDepartment.dto';
import { UpdateDepartmentDto } from './dtos/updateDepartment.dto';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.create(createDepartmentDto);
    return new SuccessResponse({
      data: department,
      message: 'Get department successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Res() res: Response) {
    const departments = await this.departmentService.findAll();
    return new SuccessResponse({
      data: departments,
      message: 'Get departments successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const department = await this.departmentService.findOne(id);
    return new SuccessResponse({
      data: department,
      message: 'Get department successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Res() res: Response,
  ) {
    const department = await this.departmentService.update(
      id,
      updateDepartmentDto,
    );
    return new SuccessResponse({
      data: department,
      message: 'Update department successfully',
    }).send(res);
  }

  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.departmentService.remove(id);
    return new SuccessResponse({
      message: 'Delete department successfully',
    }).send(res);
  }
}
