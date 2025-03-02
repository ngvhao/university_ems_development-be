import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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
  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByUserCode(userCode: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { userCode } });
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(userDto: CreateUserDto): Promise<UserEntity> {
    const userExists = await this.getUserByEmail(userDto.email);
    if (userExists) {
      throw new ConflictException('User email already existed');
    }
    return this.userRepository.save({
      ...userDto,
      role: EUserRole.ADMINISTRATOR,
      userCode: await this.generateAdminCode(EUserRole.ADMINISTRATOR),
    });
  }
  async updateUser(updateUserDto: UpdateUserDto, id: number): Promise<void> {
    await this.userRepository.update(id, updateUserDto);
  }

  async generateStudentCode(
    facultyCode: string,
    academicYear: number,
    majorId: number,
  ): Promise<string> {
    const lastUser = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.student', 'student')
      .where('student.majorId = :majorId', { majorId })
      .andWhere('user.role = :role', { role: EUserRole.STUDENT })
      .andWhere('student.academicYear = :academicYear', { academicYear })
      .orderBy('user.userCode', 'DESC')
      .getOne();

    console.log('lastUSer:', lastUser);
    const lastIndex = lastUser ? parseInt(lastUser.userCode.slice(-5)) : 0;
    let studentCode: string | PromiseLike<string>;
    let retryCount = 0;

    while (retryCount < 5) {
      studentCode = await Helpers.generateUserCode(
        facultyCode,
        academicYear,
        lastIndex + retryCount,
      );
      const existingUser = await this.userRepository.findOne({
        where: { userCode: studentCode },
      });
      if (!existingUser) break;
      retryCount++;
    }
    console.log('lastIDX:', lastIndex);

    if (retryCount >= 5) {
      throw new Error(
        'Cannot generate a unique studentCode after multiple attempts',
      );
    }

    return studentCode;
  }

  async generateAdminCode(role: EUserRole): Promise<string> {
    if (
      role !== EUserRole.ADMINISTRATOR &&
      role !== EUserRole.ACADEMIC_MANAGER
    ) {
      throw new Error('Invalid role for generating admin code');
    }

    const lastUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role })
      .orderBy('user.userCode', 'DESC')
      .getOne();

    const lastIndex = lastUser ? parseInt(lastUser.userCode.slice(-5)) : 0;
    console.log('LastIDX:', lastIndex);
    const adminCode = await Helpers.generateAdminCode(role, lastIndex);
    const existingUser = await this.userRepository.findOne({
      where: { userCode: adminCode },
    });
    if (existingUser) {
      throw new Error('Fail in creating admin code');
    }

    return adminCode;
  }
}
