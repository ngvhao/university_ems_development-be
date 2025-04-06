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
    const object = args.object as CreateFacultyRegistrationScheduleDto; // Cast to the correct DTO type

    // Get the date strings from the objectz
    const preRegStartStr = object.preRegistrationStartDate;
    const preRegEndStr = object.preRegistrationEndDate;
    const regStartStr = object.registrationStartDate;
    const regEndStr = object.registrationEndDate;

    // Basic check: ensure all required date strings are present (handled by @IsNotEmpty, but good practice)
    if (!preRegStartStr || !preRegEndStr || !regStartStr || !regEndStr) {
      // This case should ideally be caught by individual field validators first
      return false;
    }

    // Convert to Date objects
    const preRegStart = new Date(preRegStartStr);
    const preRegEnd = new Date(preRegEndStr);
    const regStart = new Date(regStartStr);
    const regEnd = new Date(regEndStr);

    // Check if any date string was invalid resulting in NaN
    if (
      isNaN(preRegStart.getTime()) ||
      isNaN(preRegEnd.getTime()) ||
      isNaN(regStart.getTime()) ||
      isNaN(regEnd.getTime())
    ) {
      return false; // Invalid date format, should be caught by @IsDateString, but double-check
    }

    // Perform the date logic validation
    const isPreRegOrderValid = preRegEnd > preRegStart;
    const isRegOrderValid = regEnd > regStart;
    const isRegAfterPreReg = regStart >= preRegEnd; // Allow start exactly when pre-reg ends

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
      propertyName: undefined, // This property isn't actually used by the constraint logic, but required by registerDecorator
      options: validationOptions,
      constraints: [],
      validator: AreDatesValidConstraint,
    });
  };
}
