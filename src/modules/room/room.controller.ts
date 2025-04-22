import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RoomService } from './room.service';
import { SuccessResponse } from 'src/utils/response';
import { Response } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { UpdateRoomDto } from './dtos/updateRoom.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Rooms')
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(RolesGuard)
  @Roles([
    EUserRole[EUserRole.ADMINISTRATOR],
    EUserRole[EUserRole.ACADEMIC_MANAGER],
  ])
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto, @Res() res: Response) {
    const room = await this.roomService.create(createRoomDto);
    return new SuccessResponse({
      data: room,
      message: 'Create room successfully',
    }).send(res);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Res() res: Response) {
    const { data, meta } = await this.roomService.findAll(paginationDto);
    return new SuccessResponse({
      data,
      metadata: meta,
      message: 'Get all rooms successfully',
    }).send(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const room = await this.roomService.findOne(id);
    return new SuccessResponse({
      data: room,
      message: 'Get room successfully',
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
    @Body() updateRoomDto: UpdateRoomDto,
    @Res() res: Response,
  ) {
    const room = await this.roomService.update(id, updateRoomDto);
    return new SuccessResponse({
      data: room,
      message: 'Update room successfully',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([EUserRole[EUserRole.ADMINISTRATOR]])
  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    await this.roomService.remove(id);
    return new SuccessResponse({
      message: 'Delete room successfully',
    }).send(res);
  }
}
