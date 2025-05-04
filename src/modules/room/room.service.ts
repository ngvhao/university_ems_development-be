import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { generatePaginationMeta } from 'src/utils/common/getPagination.utils';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { MetaDataInterface } from 'src/utils/interfaces/meta-data.interface';
import { CreateRoomDto } from './dtos/createRoom.dto';
import { UpdateRoomDto } from './dtos/updateRoom.dto';

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
   * @param paginationDto - DTO chứa thông tin phân trang (page, limit).
   * @returns Promise<{ data: RoomEntity[]; meta: MetaDataInterface }> - Danh sách phòng và thông tin metadata phân trang.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: RoomEntity[]; meta: MetaDataInterface }> {
    const { page = 1, limit = 10 } = paginationDto;

    const queryBuilder = this.roomRepository.createQueryBuilder('room');

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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
}
