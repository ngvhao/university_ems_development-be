import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Delete,
  Res,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Req,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { SuccessResponse } from 'src/utils/response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dtos/createUser.dto';
import { UpdateUserDto } from '../user/dtos/updateUser.dto';
import { RequestHasUserDto } from 'src/utils/request-has-user-dto';
import { Request } from 'express';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@ApiTags('Người dùng (Users)')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Kiểm tra quyền truy cập của người dùng
   * @param currentUser - Người dùng hiện tại
   * @param targetUserId - ID của người dùng cần truy cập
   * @throws ForbiddenException nếu không có quyền
   */
  private checkUserAccess(
    currentUser: { id: number; role: EUserRole },
    targetUserId: number,
  ): void {
    if (currentUser.role === EUserRole.ADMINISTRATOR) {
      return;
    }

    if (currentUser.id !== targetUserId) {
      throw new ForbiddenException(
        'Bạn chỉ có quyền truy cập thông tin của chính mình.',
      );
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Tạo người dùng mới',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tạo người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email hoặc mã người dùng đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async createAdmin(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    await this.userService.createUser(createUserDto);
    return new SuccessResponse({ message: 'Tạo người dùng thành công' }).send(
      res,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết người dùng bằng ID' })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    this.checkUserAccess(currentUser, id);

    const user = await this.userService.getUserById(id);
    return new SuccessResponse({
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    }).send(res);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng hiện tại' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin cá nhân thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async getMyProfile(
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const user = await this.userService.getUserById(currentUser.id);
    return new SuccessResponse({
      message: 'Lấy thông tin cá nhân thành công',
      data: user,
    }).send(res);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  async getUsers(@Res() res: Response, @Query() paginationDto: PaginationDto) {
    const { users, meta } = await this.userService.findAll({
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
    return new SuccessResponse({
      message: 'Lấy danh sách người dùng thành công',
      data: users,
      metadata: meta,
    }).send(res);
  }

  @Put('me/profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân của người dùng hiện tại',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin cá nhân thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async updateMyProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const updatedUser = await this.userService.updateUser(
      currentUser.id,
      updateUserDto,
    );
    return new SuccessResponse({
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedUser,
    }).send(res);
  }

  @Patch('me/profile')
  @ApiOperation({
    summary: 'Cập nhật một phần thông tin cá nhân của người dùng hiện tại',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thông tin cá nhân thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async patchMyProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    const updatedUser = await this.userService.updateUser(
      currentUser.id,
      updateUserDto,
    );
    return new SuccessResponse({
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedUser,
    }).send(res);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Cập nhật toàn bộ thông tin người dùng',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    this.checkUserAccess(currentUser, id);

    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    return new SuccessResponse({
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    }).send(res);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật một phần thông tin người dùng',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async patchUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestHasUserDto & Request,
    @Res() res: Response,
  ) {
    const currentUser = req.user;
    this.checkUserAccess(currentUser, id);

    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    return new SuccessResponse({
      message: 'Cập nhật người dùng thành công',
      data: updatedUser,
    }).send(res);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([EUserRole.ADMINISTRATOR])
  @ApiOperation({
    summary: 'Xóa người dùng (Chỉ dành cho Administrator)',
  })
  @ApiParam({ name: 'id', description: 'ID của người dùng', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa người dùng thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy người dùng.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Lỗi máy chủ nội bộ.',
  })
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    await this.userService.deleteUser(id);
    return new SuccessResponse({
      message: 'Xóa người dùng thành công',
    }).send(res);
  }
}
