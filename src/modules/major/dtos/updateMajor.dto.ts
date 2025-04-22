import { PartialType } from '@nestjs/mapped-types';
import { CreateMajorDto } from './createMajor.dto';

export class UpdateMajorDto extends PartialType(CreateMajorDto) {}
