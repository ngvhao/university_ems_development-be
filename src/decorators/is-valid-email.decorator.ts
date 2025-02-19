import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { EMAIL_REGEX } from 'src/utils/contants';

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isValidEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          const emailRegex = EMAIL_REGEX;
          return emailRegex.test(value);
        },
        defaultMessage(arguments_: ValidationArguments) {
          return `${arguments_.property} must be a valid email address.`;
        },
      },
    });
  };
}
