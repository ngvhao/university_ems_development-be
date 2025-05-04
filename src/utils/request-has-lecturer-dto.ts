import { IsNotEmpty } from 'class-validator';
import { LecturerEntity } from 'src/modules/lecturer/entities/lecturer.entity';

export class RequestHasLecturerDto {
  @IsNotEmpty({ message: 'Lecturer must be provided.' })
  lecturer: LecturerEntity;

  constructor(lecturer: LecturerEntity) {
    this.lecturer = lecturer;
  }
}
