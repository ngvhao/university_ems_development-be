import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  ParseIntPipe,
  HttpStatus,
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
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { EUserRole } from 'src/utils/enums/user.enum';
// import { Roles } from 'src/decorators/roles.decorator';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dtos/createUser.dto';

@ApiTags('Người dùng (Users)')
@ApiBearerAuth('token')
// @UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles([EUserRole.ADMINISTRATOR])
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
    @Res() res: Response,
  ) {
    const user = await this.userService.getUserById(id);
    return new SuccessResponse({
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    }).send(res);
  }

  // - GET / (findAll với phân trang, lọc, tìm kiếm)
  // - PATCH /:id (updateUser)
  // - DELETE /:id (deleteUser)
}
