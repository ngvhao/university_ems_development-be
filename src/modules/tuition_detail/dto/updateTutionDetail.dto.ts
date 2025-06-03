import { PartialType } from '@nestjs/swagger';
import { CreateTuitionDetailDto } from './createTuitionDetail.dto';

export class UpdateTuitionDetailDto extends PartialType(
  CreateTuitionDetailDto,
) {}
