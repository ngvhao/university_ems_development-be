import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = await validate(object);
    if (errors.length > 0) {
      const validationErrors = errors.map((error) => {
        return {
          property: error.property,
          value: error.value ?? null,
          constraints: error.constraints,
        };
      });
      throw new BadRequestException({
        message: 'Validation failed!',
        errors: validationErrors,
      });
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toValidate(metatype: any) {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
