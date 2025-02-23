import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { EMAIL_REGEX } from 'src/utils/constants';

export function IsValidEmail(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isValidEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
