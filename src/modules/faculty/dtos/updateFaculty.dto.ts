import { PartialType } from '@nestjs/swagger';
import { CreateFacultyDto } from './createFaculty.dto';

export class UpdateFacultyDto extends PartialType(CreateFacultyDto) {}
