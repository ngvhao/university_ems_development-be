import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsTimeBeforeConstraint', async: false })
class IsTimeBeforeConstraint implements ValidatorConstraintInterface {
  /**
   * Hàm validate chính.
   * @param value Giá trị của trường được decorate (ví dụ: endTime).
   * @param args Thông tin ngữ cảnh validation.
   * @returns boolean True nếu hợp lệ, false nếu không.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (typeof value !== 'string' || typeof relatedValue !== 'string') {
      return true;
    }

    return value > relatedValue;
  }

  /**
   * Hàm trả về message lỗi mặc định.
   * @param args Thông tin ngữ cảnh validation.
   * @returns string Message lỗi.
   */
  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} phải là thời gian sau ${relatedPropertyName}.`;
  }
}

/**
 * Decorator Function: Hàm để sử dụng như @IsTimeBefore('tenTruongSoSanh')
 * @param relatedPropertyName Tên của trường chứa thời gian bắt đầu (phải có trong cùng DTO).
 * @param validationOptions Các tùy chọn validation của class-validator.
 */
export function IsTimeBefore(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isTimeBefore',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [relatedPropertyName],
      options: validationOptions,
      validator: IsTimeBeforeConstraint,
    });
  };
}
