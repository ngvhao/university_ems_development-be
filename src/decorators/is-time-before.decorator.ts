import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface TimezoneObject {
  timezone?: string;
  [key: string]: string | number | undefined;
}

@ValidatorConstraint({ name: 'isTimeBefore', async: false })
export class IsTimeBeforeConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, string>)[
      relatedPropertyName
    ];

    // Get timezone from the object if available, otherwise use default
    const timezone =
      (args.object as TimezoneObject).timezone || 'Asia/Ho_Chi_Minh';

    if (!propertyValue || !relatedValue) {
      return true;
    }

    // Convert UTC times to local time based on timezone, then to minutes for comparison
    const endTimeMinutes = this.utcTimeToLocalMinutes(propertyValue, timezone);
    const startTimeMinutes = this.utcTimeToLocalMinutes(relatedValue, timezone);

    console.log(
      `Debug validation: UTC ${propertyValue} -> local ${endTimeMinutes} min vs UTC ${relatedValue} -> local ${startTimeMinutes} min in timezone ${timezone}`,
    );

    // For overnight schedules, endTime can be less than startTime
    // But we need to ensure it's a reasonable overnight schedule (not just any endTime < startTime)
    if (endTimeMinutes < startTimeMinutes) {
      // Check if this is a reasonable overnight schedule
      // Overnight schedules typically end early morning (before 6 AM) and start late evening (after 8 PM)
      const isReasonableOvernight = this.isReasonableOvernightSchedule(
        startTimeMinutes,
        endTimeMinutes,
      );

      console.log(
        `Overnight schedule detected - ${isReasonableOvernight ? 'PASSED' : 'FAILED'}`,
      );
      return isReasonableOvernight;
    }

    // For same-day schedules, endTime must be greater than startTime
    const result = endTimeMinutes > startTimeMinutes;
    console.log(
      `Same-day schedule - validation ${result ? 'PASSED' : 'FAILED'}`,
    );
    return result;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private utcTimeToLocalMinutes(
    utcTimeString: string,
    timezone: string,
  ): number {
    const [utcHours, utcMinutes] = utcTimeString.split(':').map(Number);

    // Create a UTC date object
    const utcDate = new Date();
    utcDate.setUTCHours(utcHours, utcMinutes, 0, 0);

    // Convert to local time in the specified timezone
    const localDate = new Date(
      utcDate.toLocaleString('en-US', { timeZone: timezone }),
    );

    // Get local hours and minutes
    const localHours = localDate.getHours();
    const localMinutes = localDate.getMinutes();

    return localHours * 60 + localMinutes;
  }

  private isReasonableOvernightSchedule(
    startMinutes: number,
    endMinutes: number,
  ): boolean {
    // Convert minutes back to hours for easier logic
    const startHour = Math.floor(startMinutes / 60);
    const endHour = Math.floor(endMinutes / 60);

    // Overnight schedule should:
    // - Start in late evening (after 8 PM / 20:00)
    // - End in early morning (before 6 AM / 06:00)
    const isLateStart = startHour >= 20; // 8 PM or later
    const isEarlyEnd = endHour < 6; // Before 6 AM

    console.log(
      `Overnight check: startHour=${startHour} (${isLateStart ? 'late' : 'not late'}), endHour=${endHour} (${isEarlyEnd ? 'early' : 'not early'})`,
    );

    return isLateStart && isEarlyEnd;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const timezone = (args.object as TimezoneObject).timezone;
    const timezoneText = timezone ? ` (${timezone})` : '';

    // Check if this is an overnight schedule case
    const endTime = args.value;
    const startTime = (args.object as Record<string, string>)[
      relatedPropertyName
    ];

    if (endTime && startTime) {
      const endMinutes = this.timeToMinutes(endTime);
      const startMinutes = this.timeToMinutes(startTime);

      if (endMinutes < startMinutes) {
        // Check if it's a reasonable overnight schedule
        const isReasonable = this.isReasonableOvernightSchedule(
          startMinutes,
          endMinutes,
        );
        if (isReasonable) {
          return `${args.property} và ${relatedPropertyName} tạo thành lịch học qua đêm hợp lệ.`;
        } else {
          return `${args.property} phải là thời gian sau ${relatedPropertyName}${timezoneText}. Lịch học qua đêm phải bắt đầu từ 20:00 trở đi và kết thúc trước 06:00.`;
        }
      }
    }

    return `${args.property} phải là thời gian sau ${relatedPropertyName}${timezoneText}.`;
  }
}

export function IsTimeBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsTimeBeforeConstraint,
    });
  };
}
