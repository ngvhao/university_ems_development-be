import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Helpers } from 'src/utils/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Lấy thông tin người dùng bằng ID.
   * @param id - ID của người dùng cần tìm.
   * @returns Promise<UserEntity> - Thông tin chi tiết người dùng.
   * @throws NotFoundException - Nếu không tìm thấy người dùng.
   */
  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}.`);
    }
    return user;
  }

  /**
   * Lấy một người dùng dựa trên điều kiện tùy chỉnh, có thể chọn trường và quan hệ.
   * @param condition - Điều kiện tìm kiếm (ví dụ: { email: '...' }).
   * @param relations - Các quan hệ cần load (ví dụ: { student: true }).
   * @param selectFields - Các trường của UserEntity cần lấy (ví dụ: ['id', 'firstName']).
   * @param selectRelationsFields - Các trường của quan hệ cần lấy (ví dụ: { student: ['majorId'] }).
   * @returns Promise<Partial<UserEntity> | null> - Thông tin người dùng (có thể chỉ một phần) hoặc null.
   */
  async getOne(
    condition: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[],
    relations?: FindOptionsRelations<UserEntity>,
    selectFields?: (keyof UserEntity)[],
    selectRelationsFields?: { [K in keyof UserEntity]?: string[] },
  ): Promise<Partial<UserEntity> | null> {
    const query = this.userRepository.createQueryBuilder('user');

    query.where(condition);

    if (selectFields?.length) {
      query.select(selectFields.map((field) => `user.${field}`));
    }

    if (relations) {
      for (const relationName of Object.keys(relations)) {
        if (relations[relationName as keyof UserEntity]) {
          query.leftJoinAndSelect(`user.${relationName}`, relationName);

          const relationSelects =
            selectRelationsFields?.[relationName as keyof UserEntity];
          if (relationSelects?.length) {
            query.addSelect(
              relationSelects.map((field) => `${relationName}.${field}`),
            );
          }
        }
      }
    }

    return query.getOne();
  }

  /**
   * Tìm người dùng dựa trên email cá nhân. Có thể có nhiều người dùng tạm thời trùng email cá nhân?
   * Cân nhắc lại logic nếu email cá nhân phải là duy nhất.
   * @param email - Email cá nhân cần tìm.
   * @returns Promise<UserEntity[]> - Mảng các người dùng tìm thấy (thường là 0 hoặc 1 nếu email là duy nhất).
   */
  async getUserByPersonalEmail(email: string): Promise<UserEntity[]> {
    return this.userRepository.find({ where: { personalEmail: email } });
  }

  /**
   * Tìm người dùng dựa trên email trường cấp (universityEmail).
   * Email này thường là duy nhất.
   * @param email - Email trường cấp cần tìm.
   * @returns Promise<UserEntity | null> - Thông tin người dùng hoặc null nếu không tìm thấy.
   */
  async getUserByUniEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { universityEmail: email } });
  }

  /**
   * Tạo người dùng mới (hiện tại đang cấu hình để tạo Admin và Quản lý đào tạo).
   * Cần kiểm tra lại logic gán vai trò và tạo userCode nếu DTO có thể dùng cho các vai trò khác.
   * @param userDto - Dữ liệu người dùng từ DTO.
   * @returns Promise<UserEntity> - Người dùng vừa được tạo.
   * @throws ConflictException - Nếu email cá nhân hoặc email trường cấp đã tồn tại.
   * @throws InternalServerErrorException - Nếu không thể tạo user code duy nhất.
   */
  async createUser(userDto: CreateUserDto): Promise<UserEntity> {
    // const existingPersonal = await this.getUserByPersonalEmail(
    //   userDto.personalEmail,
    // );
    // if (existingPersonal.length > 0) {
    //   throw new ConflictException(
    //     `Email cá nhân '${userDto.personalEmail}' đã được sử dụng.`,
    //   );
    // }

    const existingUniEmail = await this.getUserByUniEmail(
      userDto.universityEmail,
    );
    if (existingUniEmail) {
      throw new ConflictException(
        `Email trường '${userDto.universityEmail}' đã tồn tại.`,
      );
    }

    const hashedPassword = await Helpers.hashPassword({
      password: userDto.identityCardNumber,
    });

    const roleToCreate = userDto.role || EUserRole.STUDENT;
    try {
      if (
        roleToCreate === EUserRole.ADMINISTRATOR ||
        roleToCreate === EUserRole.ACADEMIC_MANAGER
      ) {
      } else if (roleToCreate === EUserRole.STUDENT) {
      } else if (roleToCreate === EUserRole.LECTURER) {
        throw new BadRequestException(
          `Chưa hỗ trợ tạo mã cho vai trò: ${roleToCreate}`,
        );
      }
    } catch (error) {
      console.error('Lỗi khi tạo user code:', error);
      throw new InternalServerErrorException(
        'Không thể tạo mã người dùng duy nhất.',
      );
    }

    // const universityEmail = `${userDto.firstName + userDto.lastName.toLowerCase()}@university.edu.vn`;
    // const existingUniEmail = await this.getUserByUniEmail(universityEmail);
    // if (existingUniEmail) {
    //   throw new ConflictException(
    //     `Email trường cấp '${universityEmail}' được tạo tự động đã tồn tại.`,
    //   );
    // }

    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
      role: roleToCreate,
      dateOfBirth: userDto.dateOfBirth
        ? new Date(userDto.dateOfBirth)
        : undefined,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Lỗi trùng lặp dữ liệu khi lưu người dùng (email hoặc mã người dùng).',
        );
      }
      console.error('Lỗi khi lưu người dùng:', error);
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi khi tạo người dùng.',
      );
    }
  }

  /**
   * Cập nhật thông tin người dùng.
   * @param id - ID người dùng cần cập nhật.
   * @param updateUserDto - Dữ liệu cần cập nhật.
   * @returns Promise<UserEntity> - Thông tin người dùng sau khi cập nhật.
   * @throws NotFoundException - Nếu không tìm thấy người dùng.
   * @throws ConflictException - Nếu email cập nhật bị trùng với người dùng khác.
   */
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
      dateOfBirth: updateUserDto.dateOfBirth
        ? new Date(updateUserDto.dateOfBirth)
        : undefined,
    });

    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${id} để cập nhật.`,
      );
    }

    if (
      updateUserDto.personalEmail &&
      updateUserDto.personalEmail !== user.personalEmail
    ) {
      const existingPersonal = await this.getUserByPersonalEmail(
        updateUserDto.personalEmail,
      );
      if (
        existingPersonal.length > 0 &&
        existingPersonal.some((u) => u.id !== id)
      ) {
        throw new ConflictException(
          `Email cá nhân '${updateUserDto.personalEmail}' đã được sử dụng bởi người dùng khác.`,
        );
      }
      user.personalEmail = updateUserDto.personalEmail;
    }

    if (updateUserDto) {
      user.password = await Helpers.hashPassword({
        password: updateUserDto.password,
      });
    }

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Lỗi trùng lặp dữ liệu khi cập nhật người dùng (email).',
        );
      }
      console.error('Lỗi khi cập nhật người dùng:', error);
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi khi cập nhật người dùng.',
      );
    }
  }
}
