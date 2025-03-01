import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassEntity } from './entities/class.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
  ) {}

  async getOneByClassId({
    classId,
  }: {
    classId: number;
  }): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['major', 'major.department', 'major.department.faculty'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    return classEntity;
  }
}
