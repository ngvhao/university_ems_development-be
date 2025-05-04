import { PartialType } from '@nestjs/swagger';
import { CreateMajorDto } from './createMajor.dto';

export class UpdateMajorDto extends PartialType(CreateMajorDto) {}
