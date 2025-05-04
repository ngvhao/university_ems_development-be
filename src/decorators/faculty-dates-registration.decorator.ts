import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { CreateFacultyRegistrationScheduleDto } from 'src/modules/faculty_registration_schedule/dtos/createFacultyRegistrationSchedule.dto';

@ValidatorConstraint({ name: 'areDatesValid', async: false })
export class AreDatesValidConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments) {
    const object = args.object as CreateFacultyRegistrationScheduleDto;

    const preRegStartStr = object.preRegistrationStartDate;
    const preRegEndStr = object.preRegistrationEndDate;
    const regStartStr = object.registrationStartDate;
    const regEndStr = object.registrationEndDate;

    if (!preRegStartStr || !preRegEndStr || !regStartStr || !regEndStr) {
      return false;
    }

    const preRegStart = new Date(preRegStartStr);
    const preRegEnd = new Date(preRegEndStr);
    const regStart = new Date(regStartStr);
    const regEnd = new Date(regEndStr);

    if (
      isNaN(preRegStart.getTime()) ||
      isNaN(preRegEnd.getTime()) ||
      isNaN(regStart.getTime()) ||
      isNaN(regEnd.getTime())
    ) {
      return false;
    }

    const isPreRegOrderValid = preRegEnd > preRegStart;
    const isRegOrderValid = regEnd > regStart;
    const isRegAfterPreReg = regStart >= preRegEnd;

    return isPreRegOrderValid && isRegOrderValid && isRegAfterPreReg;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as CreateFacultyRegistrationScheduleDto;
    const preRegStart = new Date(object.preRegistrationStartDate);
    const preRegEnd = new Date(object.preRegistrationEndDate);
    const regStart = new Date(object.registrationStartDate);
    const regEnd = new Date(object.registrationEndDate);

    if (
      isNaN(preRegStart.getTime()) ||
      isNaN(preRegEnd.getTime()) ||
      isNaN(regStart.getTime()) ||
      isNaN(regEnd.getTime())
    ) {
      return 'One or more date fields have an invalid format.';
    }

    const messages = [];
    if (preRegEnd <= preRegStart) {
      messages.push('Pre-registration end date must be after its start date.');
    }
    if (regEnd <= regStart) {
      messages.push('Registration end date must be after its start date.');
    }
    if (regStart < preRegEnd) {
      messages.push(
        'Registration start date must be on or after the pre-registration end date.',
      );
    }
    return messages.join(' ');
  }
}

// Helper function to use the constraint as a decorator
export function AreDatesValid(validationOptions?: ValidationOptions) {
  return function (object: object) {
    registerDecorator({
      target: object.constructor,
      propertyName: undefined,
      options: validationOptions,
      constraints: [],
      validator: AreDatesValidConstraint,
    });
  };
}
