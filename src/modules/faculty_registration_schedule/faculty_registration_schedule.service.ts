import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { CreateFacultyRegistrationScheduleDto } from './dtos/createFacultyRegistrationSchedule.dto';
import { UpdateFacultyRegistrationScheduleDto } from './dtos/updateFacultyRegistrationSchedule.dto';
import { FacultyRegistrationScheduleEntity } from './entities/faculty_registration_schedule.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';

@Injectable()
export class FacultyRegistrationScheduleService {
  constructor(
    @InjectRepository(FacultyRegistrationScheduleEntity)
    private readonly scheduleRepository: Repository<FacultyRegistrationScheduleEntity>,
  ) {}

  async create(
    createDto: CreateFacultyRegistrationScheduleDto,
  ): Promise<FacultyRegistrationScheduleEntity> {
    const scheduleData = {
      ...createDto,
      preRegistrationStartDate: new Date(createDto.preRegistrationStartDate),
      preRegistrationEndDate: new Date(createDto.preRegistrationEndDate),
      registrationStartDate: new Date(createDto.registrationStartDate),
      registrationEndDate: new Date(createDto.registrationEndDate),
    };
    const newSchedule = this.scheduleRepository.create(scheduleData);
    return this.scheduleRepository.save(newSchedule);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: FacultyRegistrationScheduleEntity[];
    meta: MetaDataInterface;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.scheduleRepository.findAndCount({
      skip,
      take: limit,
      relations: ['faculty', 'semester'],
      order: { createdAt: 'DESC' },
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<FacultyRegistrationScheduleEntity> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['faculty', 'semester'],
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy lịch đăng ký với ID ${id}`);
    }
    return schedule;
  }

  async update(
    id: number,
    updateDto: UpdateFacultyRegistrationScheduleDto,
  ): Promise<FacultyRegistrationScheduleEntity> {
    await this.findOne(id);

    const updateData: Partial<FacultyRegistrationScheduleEntity> = {
      ...updateDto,
    };
    if (updateDto.preRegistrationStartDate) {
      updateData.preRegistrationStartDate = new Date(
        updateDto.preRegistrationStartDate,
      );
    }
    if (updateDto.preRegistrationEndDate) {
      updateData.preRegistrationEndDate = new Date(
        updateDto.preRegistrationEndDate,
      );
    }
    if (updateDto.registrationStartDate) {
      updateData.registrationStartDate = new Date(
        updateDto.registrationStartDate,
      );
    }
    if (updateDto.registrationEndDate) {
      updateData.registrationEndDate = new Date(updateDto.registrationEndDate);
    }

    await this.scheduleRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy lịch đăng ký với ID ${id} để xóa`,
      );
    }
  }
}
