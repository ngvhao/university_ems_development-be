import { PartialType } from '@nestjs/swagger';

import { CreateLecturerDto } from './createLecturer.dto';

export class UpdateLecturerDto extends PartialType(CreateLecturerDto) {}
