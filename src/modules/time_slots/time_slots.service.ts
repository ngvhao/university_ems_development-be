import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTimeSlotDto } from './dto/createTimeSlot.dto';
import { UpdateTimeSlotDto } from './dto/updateTimeSlot.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { TimeSlotsEntity } from './entities/time_slots.entity';

@Injectable()
export class TimeSlotsService {
  constructor(
    @InjectRepository(TimeSlotsEntity)
    private readonly timeSlotRepository: Repository<TimeSlotsEntity>,
  ) {}

  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlotsEntity> {
    const timeSlot = this.timeSlotRepository.create(createTimeSlotDto);
    return await this.timeSlotRepository.save(timeSlot);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: TimeSlotsEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.timeSlotRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  async findOne(id: number): Promise<TimeSlotsEntity> {
    return this.timeSlotRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateTimeSlotDto: UpdateTimeSlotDto,
  ): Promise<TimeSlotsEntity> {
    await this.timeSlotRepository.update(id, updateTimeSlotDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.timeSlotRepository.delete(id);
  }
}
