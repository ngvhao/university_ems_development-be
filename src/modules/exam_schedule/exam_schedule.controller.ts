import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExamScheduleService } from './exam_schedule.service';
import { CreateExamScheduleDto } from './dtos/createExamSchedule.dto';
import { UpdateExamScheduleDto } from './dtos/updateExamSchedule.dto';
import { ExamScheduleEntity } from './entities/exam_schedule.entity';

@ApiTags('Exam Schedules')
@Controller('exam-schedules')
export class ExamScheduleController {
  constructor(private readonly examScheduleService: ExamScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exam schedule' })
  @ApiResponse({
    status: 201,
    description: 'Exam schedule created successfully',
    type: ExamScheduleEntity,
  })
  create(
    @Body() createExamScheduleDto: CreateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    return this.examScheduleService.create(createExamScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exam schedules' })
  @ApiResponse({
    status: 200,
    description: 'Return all exam schedules',
    type: [ExamScheduleEntity],
  })
  findAll(): Promise<ExamScheduleEntity[]> {
    return this.examScheduleService.findAll();
  }

  @Get('class-group/:classGroupId')
  @ApiOperation({ summary: 'Get exam schedules by class group' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedules for specific class group',
    type: [ExamScheduleEntity],
  })
  findByClassGroup(
    @Param('classGroupId') classGroupId: string,
  ): Promise<ExamScheduleEntity[]> {
    return this.examScheduleService.findByClassGroup(+classGroupId);
  }

  @Get('semester/:semesterId')
  @ApiOperation({ summary: 'Get exam schedules by semester' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedules for specific semester',
    type: [ExamScheduleEntity],
  })
  findBySemester(
    @Param('semesterId') semesterId: string,
  ): Promise<ExamScheduleEntity[]> {
    return this.examScheduleService.findBySemester(+semesterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam schedule by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return exam schedule by ID',
    type: ExamScheduleEntity,
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  findOne(@Param('id') id: string): Promise<ExamScheduleEntity> {
    return this.examScheduleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exam schedule' })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule updated successfully',
    type: ExamScheduleEntity,
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  update(
    @Param('id') id: string,
    @Body() updateExamScheduleDto: UpdateExamScheduleDto,
  ): Promise<ExamScheduleEntity> {
    return this.examScheduleService.update(+id, updateExamScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exam schedule' })
  @ApiResponse({
    status: 200,
    description: 'Exam schedule deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Exam schedule not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.examScheduleService.remove(+id);
  }
}
