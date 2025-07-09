import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { UpdateRoomDto } from './dtos/updateRoom.dto';
import { DEFAULT_PAGINATION } from 'src/utils/constants';
import { TimeSlotEntity } from '../time_slot/entities/time_slot.entity';
interface RoomWithFreeTimeSlots extends RoomEntity {
  freeTimeSlots: TimeSlotEntity[];
}

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {}

  /**
   * Tạo một phòng học mới.
   * @param createRoomDto - Dữ liệu để tạo phòng mới.
   * @returns Promise<RoomEntity> - Phòng vừa được tạo.
   */
  async create(createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    const room = this.roomRepository.create(createRoomDto);
    const existingRoom = await this.roomRepository.findOne({
      where: { roomNumber: room.roomNumber, buildingName: room.buildingName },
    });
    if (existingRoom) {
      throw new NotFoundException(
        `Phòng học với số phòng ${room.roomNumber} và tòa nhà ${room.buildingName} đã tồn tại.`,
      );
    }
    return this.roomRepository.save(room);
  }

  /**
   * Lấy danh sách các phòng học có phân trang.
   * @param condition - Điều kiện truy vấn (FindOptionsWhere<RoomEntity>)
   * @param paginationDto - DTO chứa thông tin phân trang (page, limit).
   * @returns Promise<{ data: RoomEntity[]; meta: MetaDataInterface }> - Danh sách phòng và thông tin metadata phân trang.
   */
  async findAll(
    condition?: FindOptionsWhere<RoomEntity> | FindOptionsWhere<RoomEntity>[],
    paginationDto: PaginationDto = DEFAULT_PAGINATION,
  ): Promise<{ data: RoomEntity[]; meta: MetaDataInterface }> {
    const { page, limit } = paginationDto;

    const findOptions: FindManyOptions<RoomEntity> = {
      where: condition,
      skip: (page - 1) * limit,
      take: limit,
    };
    const [data, total] = await this.roomRepository.findAndCount(findOptions);
    const meta = generatePaginationMeta(total, page, limit);

    return { data, meta };
  }

  /**
   * Tìm một phòng học cụ thể bằng ID.
   * @param id - ID của phòng cần tìm.
   * @returns Promise<RoomEntity> - Thông tin chi tiết của phòng.
   * @throws NotFoundException - Nếu không tìm thấy phòng với ID cung cấp.
   */
  async findOne(id: number): Promise<RoomEntity> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}`);
    }
    return room;
  }

  /**
   * Cập nhật thông tin một phòng học.
   * @param id - ID của phòng cần cập nhật.
   * @param updateRoomDto - Dữ liệu cần cập nhật.
   * @returns Promise<RoomEntity> - Thông tin phòng sau khi cập nhật.
   * @throws NotFoundException - Nếu không tìm thấy phòng với ID cung cấp.
   */
  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<RoomEntity> {
    const room = await this.roomRepository.preload({
      id: id,
      ...updateRoomDto,
    });

    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${id}.`);
    }
    return this.roomRepository.save(room);
  }

  /**
   * Xóa một phòng học.
   * @param id - ID của phòng cần xóa.
   * @returns Promise<void>
   * @throws NotFoundException - Nếu không tìm thấy phòng với ID cung cấp.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.roomRepository.delete(id);
  }

  /**
   * Lấy danh sách phòng học có ca trống trong ngày kèm thông tin các ca trống
   * @param date - Ngày cần kiểm tra (định dạng YYYY-MM-DD)
   * @returns Promise<RoomWithFreeTimeSlots[]> - Danh sách phòng có ca trống với thông tin timeSlots
   */
  async getFreeClassroom(date: string): Promise<RoomWithFreeTimeSlots[]> {
    const allTimeSlots = await this.roomRepository.manager
      .getRepository(TimeSlotEntity)
      .find({
        order: { shift: 'ASC' },
      });

    const busyRoomsQuery = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin(
        'room.classWeeklySchedules',
        'weeklySchedule',
        ':date = ANY(weeklySchedule.scheduledDates)',
      )
      .leftJoin(
        'room.classAdjustmentSchedules',
        'adjustmentSchedule',
        'adjustmentSchedule.adjustmentDate = :date',
      )
      .leftJoin('weeklySchedule.timeSlot', 'weeklyTimeSlot')
      .leftJoin('adjustmentSchedule.timeSlot', 'adjustmentTimeSlot')
      .select([
        'room.id',
        'room.roomNumber',
        'room.buildingName',
        'room.floor',
        'room.roomType',
        'room.capacity',
        'weeklyTimeSlot.id',
        'weeklyTimeSlot.startTime',
        'weeklyTimeSlot.endTime',
        'weeklyTimeSlot.shift',
        'adjustmentTimeSlot.id',
        'adjustmentTimeSlot.startTime',
        'adjustmentTimeSlot.endTime',
        'adjustmentTimeSlot.shift',
      ])
      .setParameter('date', date);

    const busyRoomsData = await busyRoomsQuery.getMany();

    const busyTimeSlotsByRoom = new Map<number, Set<number>>();

    busyRoomsData.forEach((room) => {
      if (!busyTimeSlotsByRoom.has(room.id)) {
        busyTimeSlotsByRoom.set(room.id, new Set());
      }

      room.classWeeklySchedules?.forEach((schedule) => {
        if (schedule.timeSlot) {
          busyTimeSlotsByRoom.get(room.id)!.add(schedule.timeSlot.id);
        }
      });

      room.classAdjustmentSchedules?.forEach((schedule) => {
        if (schedule.timeSlot) {
          busyTimeSlotsByRoom.get(room.id)!.add(schedule.timeSlot.id);
        }
      });
    });

    const allRooms = await this.roomRepository.find();

    const freeRooms = allRooms
      .map((room) => {
        const busyTimeSlots = busyTimeSlotsByRoom.get(room.id) || new Set();

        const freeTimeSlots = allTimeSlots.filter(
          (timeSlot) => !busyTimeSlots.has(timeSlot.id),
        );

        if (freeTimeSlots.length > 0) {
          return {
            ...room,
            freeTimeSlots: freeTimeSlots,
          } as RoomWithFreeTimeSlots;
        }
        return null;
      })
      .filter((room): room is RoomWithFreeTimeSlots => room !== null);

    return freeRooms;
  }
}
