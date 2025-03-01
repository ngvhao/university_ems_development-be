import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';

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

  async createUser(userDTO: CreateUserDto): Promise<UserEntity> {
    const userExists = await this.getUserByEmail(userDTO.email);
    if (userExists) {
      throw new ConflictException('User email already existed');
    }
    return this.userRepository.save(userDTO);
  }
  async updateUser(updateUserDto: UpdateUserDto, id: number): Promise<void> {
    await this.userRepository.update(id, updateUserDto);
  }
}
