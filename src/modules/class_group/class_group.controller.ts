import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { ClassGroupService } from './class_group.service';
import { Roles } from 'src/decorators/roles.decorator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { EUserRole } from 'src/utils/enums/user.enum';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateClassGroupDto } from './dtos/createClassGroup.dto';
import { FilterClassGroupDto } from './dtos/filterClassGroup.dto';
import { UpdateClassGroupDto } from './dtos/updateClassGroup.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateClassGroupStatusDto } from './dtos/updateClassGroupStatus.dto';

@ApiTags('ClassGroups')
@UseGuards(JwtAuthGuard)
@Controller('class-groups')
export class ClassGroupController {
  constructor(private readonly classGroupService: ClassGroupService) {}

  @ApiBody({ type: CreateClassGroupDto })
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Post()
  async create(@Body() createDto: CreateClassGroupDto, @Res() res: Response) {
    const data = await this.classGroupService.create(createDto);
    return new SuccessResponse({
      data: data,
      message: 'Class group created successfully.',
    }).send(res);
  }

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterClassGroupDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.classGroupService.findAll(
      paginationDto,
      filterDto,
    );
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Get all class groups successfully.',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.classGroupService.findOne(id);
    return new SuccessResponse({
      data: data,
      message: 'Get class group successfully.',
    }).send(res);
  }

  @ApiBody({ type: UpdateClassGroupDto })
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassGroupDto,
    @Res() res: Response,
  ) {
    const data = await this.classGroupService.update(id, updateDto);
    return new SuccessResponse({
      data: data,
      message: 'Class group updated successfully.',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateClassGroupStatusDto,
    @Res() res: Response,
  ) {
    const data = await this.classGroupService.updateStatus(
      id,
      updateStatusDto.status,
    );
    return new SuccessResponse({
      data: data,
      message: `Class group status updated successfully to ${updateStatusDto.status}.`,
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ACADEMIC_MANAGER],
    EUserRole[EUserRole.ADMINISTRATOR],
  ])
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classGroupService.remove(id);
    return new SuccessResponse({
      message: 'Class group deleted successfully.',
    }).send(res);
  }

  // --- Các endpoint ví dụ cho nghiệp vụ đăng ký (có thể đặt ở controller khác) ---
  /*
    @UseGuards(RolesGuard)
    @Roles(EUserRole.STUDENT) // Ví dụ: Sinh viên đăng ký
    @Post(':id/register')
    async registerStudent(
        @Param('id', ParseIntPipe) id: number,
        // Lấy studentId từ user đã xác thực (ví dụ)
        // @Req() req: Request
        @Res() res: Response
    ) {
        // const studentId = req.user.studentId; // Giả sử thông tin user có studentId
        const data = await this.classGroupService.incrementRegistered(id);
        // Thêm logic lưu thông tin đăng ký của sinh viên vào bảng riêng
        return new SuccessResponse({ data, message: 'Registered successfully.' }).send(res);
    }
  
    @UseGuards(RolesGuard)
    @Roles(EUserRole.STUDENT) // Ví dụ: Sinh viên hủy đăng ký
    @Delete(':id/unregister')
    async unregisterStudent(
        @Param('id', ParseIntPipe) id: number,
        // @Req() req: Request
        @Res() res: Response
    ) {
        // const studentId = req.user.studentId;
        const data = await this.classGroupService.decrementRegistered(id);
        // Thêm logic xóa thông tin đăng ký của sinh viên khỏi bảng riêng
        return new SuccessResponse({ data, message: 'Unregistered successfully.' }).send(res);
    }
    */
}
