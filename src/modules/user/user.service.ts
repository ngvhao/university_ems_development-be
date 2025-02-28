import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dtos/createUser.dto';
import { EUserRole } from 'src/utils/enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByIdentity(
    userIdentityNumber: number,
    role: EUserRole,
  ): Promise<UserEntity> {
    if (role == EUserRole.STUDENT) {
      return this.userRepository.findOne({ where: {} });
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(data: CreateUserDTO): Promise<UserEntity> {
    const userExists = await this.getUserByEmail(data.email);
    if (userExists) {
      throw new ConflictException('User email already existed');
    }
    return this.userRepository.save(data);
  }
}
