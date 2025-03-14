import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassEntity } from './entities/class.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateClassDto } from './dtos/updateClass.dto';
import { CreateClassDto } from './dtos/createClass.dto';
import { MajorService } from '../major/major.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly majorSevice: MajorService,
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

  async create(createClassDto: CreateClassDto): Promise<ClassEntity> {
    const { classCode, majorId } = createClassDto;

    const major = await this.majorSevice.findOne(majorId);
    if (!major) {
      throw new NotFoundException(`Major with ID ${majorId} not found`);
    }

    try {
      const newClass = this.classRepository.create({
        classCode,
        major,
      });
      return await this.classRepository.save(newClass);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Class with code ${classCode} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<ClassEntity[]> {
    return this.classRepository.find({
      relations: ['major', 'students'],
    });
  }

  async findOne(id: number): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['major', 'students'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async update(
    id: number,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassEntity> {
    const classEntity = await this.findOne(id);

    if (updateClassDto.majorId) {
      const major = await this.majorSevice.findOne(updateClassDto.majorId);
      if (!major) {
        throw new NotFoundException(
          `Major with ID ${updateClassDto.majorId} not found`,
        );
      }
      classEntity.major = major;
    }

    Object.assign(classEntity, updateClassDto);
    return this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    await this.classRepository.delete(id);
  }
}
