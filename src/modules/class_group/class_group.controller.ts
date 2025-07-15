import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
  Put,
  HttpStatus,
  ConflictException,
  BadRequestException,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateClassGroupStatusDto } from './dtos/updateClassGroupStatus.dto';
import { ClassGroupEntity } from './entities/class_group.entity';
import { StudyPlanService } from '../study_plan/study_plan.service';
import { SemesterService } from '../semester/semester.service';
import { TimeSlotService } from '../time_slot/time_slot.service';
import { dateOfWeeks } from 'src/utils/constants';
import { ClassGroupScheduleInputDto } from './dtos/classGroupScheduleInput.dto';
import { LecturerService } from '../lecturer/lecturer.service';
import { RoomService } from '../room/room.service';
import { ERoomType } from 'src/utils/enums/room.enum';
import axios from 'axios';
import { SettingService } from '../setting/setting.service';
import { EnrollmentCourseService } from '../enrollment_course/enrollment_course.service';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

@ApiTags('Quản lý Nhóm lớp học (Class Groups)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('class-groups')
export class ClassGroupController {
  constructor(
    private readonly classGroupService: ClassGroupService,
    private readonly studyPlanService: StudyPlanService,
    private readonly semesterService: SemesterService,
    private readonly timeSlotService: TimeSlotService,
    private readonly lecturerService: LecturerService,
    private readonly roomService: RoomService,
    private readonly settingService: SettingService,
    private readonly enrollmentCourseService: EnrollmentCourseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Tạo một nhóm lớp mới' })
  @ApiBody({ type: CreateClassGroupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ hoặc không thể tạo nhóm.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy Học phần-Học kỳ tương ứng.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số thứ tự nhóm đã tồn tại trong học phần-học kỳ này.',
  })
  async create(@Body() createDto: CreateClassGroupDto, @Res() res: Response) {
    const data = await this.classGroupService.create(createDto);
    return new SuccessResponse({
      statusCode: HttpStatus.CREATED,
      data: data,
      message: 'Tạo nhóm lớp thành công.',
    }).send(res);
  }

  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @Post('/calculating')
  async getClassGroupSchedule(
    @Body() classGroupInputDto: ClassGroupScheduleInputDto,
    @Res() res: Response,
  ) {
    const {
      semesterId,
      courseIds,
      exceptionDates,
      occupiedSlots,
      groupSizeTarget,
      maxSessionsPerWeekAllowed,
      isExtraClassGroup,
      isRegisterFromDate,
      isRegisterToDate,
    } = classGroupInputDto;
    const classGroupsNeedScheduling =
      await this.studyPlanService.findCourseRegistrations(
        semesterId,
        courseIds,
        isExtraClassGroup,
        isRegisterFromDate ? new Date(isRegisterFromDate) : undefined,
        isRegisterToDate ? new Date(isRegisterToDate) : undefined,
      );
    if (!isExtraClassGroup) {
      const results = await Promise.all(
        courseIds.map((courseId) => {
          return this.classGroupService.getOne({ courseId: courseId });
        }),
      );
      results.forEach((classGroup) => {
        if (classGroup != null) {
          throw new ConflictException(
            `Nhóm lớp số ${classGroup.groupNumber} đã tồn tại cho Học phần - Học kỳ ID ${semesterId} của môn ${classGroup.course.name}.`,
          );
        }
      });
    }
    if (classGroupsNeedScheduling.length == 0) {
      throw new BadRequestException(
        'Không tồn tại môn nào hợp lệ để lập nhóm lớp',
      );
    }

    const semester = await this.semesterService.findOne(semesterId);
    const { data: timeSlots } = await this.timeSlotService.findAll();
    const lecturers = await this.lecturerService.findAllLecturersId();
    const { data: rooms } = await this.roomService.findAll({
      roomType: ERoomType.CLASSROOM,
    });
    console.log({
      coursesToSchedule: classGroupsNeedScheduling,
      semesterId: semester.id,
      semesterStartDate: semester.startDate,
      semesterEndDate: semester.endDate,
      daysOfWeek: dateOfWeeks,
      timeSlots: timeSlots,
      lecturers: lecturers,
      rooms: rooms,
      exceptionDates: exceptionDates,
      occupiedSlots: occupiedSlots,
      groupSizeTarget: groupSizeTarget,
      maxSessionsPerWeekAllowed: maxSessionsPerWeekAllowed,
    });
    try {
      const classGroups = await axios.post(
        'http://localhost:8000/schedules/calculating',
        {
          coursesToSchedule: classGroupsNeedScheduling,
          semesterId: semester.id,
          semesterStartDate: semester.startDate,
          semesterEndDate: semester.endDate,
          daysOfWeek: dateOfWeeks,
          timeSlots: timeSlots,
          lecturers: lecturers,
          rooms: rooms,
          exceptionDates: exceptionDates,
          occupiedSlots: occupiedSlots,
          groupSizeTarget: groupSizeTarget,
          maxSessionsPerWeekAllowed: maxSessionsPerWeekAllowed,
        },
      );
      console.log('getClassGroupSchedule@@classGroups.data', classGroups.data);
      const savedClassGroups =
        await this.classGroupService.createWithWeeklySchedule(
          classGroups.data,
          isExtraClassGroup,
        );
      return new SuccessResponse({
        message: 'Lấy nhóm lớp thành công',
        data: savedClassGroups,
      }).send(res);
    } catch (error) {
      console.log('error:', error.response.data.detail);
      throw new BadRequestException(error.response.data.detail);
    }
  }

  @Get('/me/for-registration')
  @ApiOperation({ summary: 'Lấy danh sách nhóm lớp' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng kết quả mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách nhóm lớp thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async getClassGroupsForRegistration(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterClassGroupDto,
    @Res() res: Response,
  ) {
    const nextRegisterStudyPlanSemester = await this.settingService.findOne(
      'nextRegisterCourseSemesterId',
    );
    const semester = await this.semesterService.findOne(
      nextRegisterStudyPlanSemester.value,
    );
    filterDto.semesterId = semester.id;
    const { data, meta } =
      await this.classGroupService.getClassGroupsForRegistration({
        filterDto: filterDto,
        paginationDto: paginationDto,
      });
    return new SuccessResponse({
      data: {
        classGroups: data,
        semester: semester,
      },
      metadata: meta,
      message: 'Lấy danh sách nhóm lớp thành công.',
    }).send(res);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhóm lớp (có phân trang và lọc)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng kết quả mỗi trang',
  })
  @ApiQuery({
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Lọc theo ID khoa',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    type: Number,
    description: 'Lọc theo ID bộ môn',
  })
  @ApiQuery({
    name: 'majorId',
    required: false,
    type: Number,
    description: 'Lọc theo ID ngành học',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'Lọc theo ID môn học',
  })
  @ApiQuery({
    name: 'semesterId',
    required: false,
    type: Number,
    description: 'Lọc theo ID học kỳ',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Lọc theo trạng thái',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách nhóm lớp thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterClassGroupDto,
    @Res() res: Response,
  ) {
    const { data, meta } = await this.classGroupService.findAll({
      filterDto,
      paginationDto,
    });
    return new SuccessResponse({
      data: data,
      metadata: meta,
      message: 'Lấy danh sách nhóm lớp thành công.',
    }).send(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một nhóm lớp bằng ID' })
  @ApiParam({ name: 'id', description: 'ID của nhóm lớp', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm lớp.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const data = await this.classGroupService.findOne(id);
    return new SuccessResponse({
      data: data,
      message: 'Lấy thông tin nhóm lớp thành công.',
    }).send(res);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật thông tin một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần cập nhật',
    type: Number,
  })
  @ApiBody({ type: UpdateClassGroupDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dữ liệu không hợp lệ hoặc vi phạm logic (VD: maxStudents < registeredStudents).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm lớp.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Số thứ tự nhóm mới bị trùng.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassGroupDto,
    @Res() res: Response,
  ) {
    const data = await this.classGroupService.update(id, updateDto);
    return new SuccessResponse({
      data: data,
      message: 'Cập nhật nhóm lớp thành công.',
    }).send(res);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Cập nhật trạng thái của một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần cập nhật trạng thái',
    type: Number,
  })
  @ApiBody({ type: UpdateClassGroupStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật trạng thái nhóm lớp thành công.',
    type: ClassGroupEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu trạng thái không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm lớp.',
  })
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
      message: `Cập nhật trạng thái nhóm lớp thành công thành '${updateStatusDto.status}'.`,
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ACADEMIC_MANAGER, EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Xóa một nhóm lớp' })
  @ApiParam({
    name: 'id',
    description: 'ID của nhóm lớp cần xóa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa nhóm lớp thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể xóa nhóm lớp (VD: đã có sinh viên đăng ký).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm lớp.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.classGroupService.remove(id);
    return new SuccessResponse({
      message: 'Xóa nhóm lớp thành công.',
    }).send(res);
  }

  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles([
    EUserRole.ACADEMIC_MANAGER,
    EUserRole.ADMINISTRATOR,
    EUserRole.LECTURER,
  ])
  @ApiOperation({
    summary: 'Lấy danh sách sinh viên đang theo học nhóm lớp này',
  })
  @ApiParam({ name: 'id', description: 'ID của nhóm lớp', type: Number })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng kết quả mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách sinh viên thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem danh sách sinh viên.',
  })
  async getStudentsOfClassGroup(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
    @Res() res: Response,
    @Query('status') status?: EEnrollmentStatus,
  ) {
    const filterStatus = status ? status : EEnrollmentStatus.ENROLLED;
    const { students, meta } =
      await this.classGroupService.getStudentsOfClassGroup(
        id,
        paginationDto,
        filterStatus,
      );
    return new SuccessResponse({
      data: students,
      metadata: meta,
      message: 'Lấy danh sách sinh viên thành công.',
    }).send(res);
  }
}
