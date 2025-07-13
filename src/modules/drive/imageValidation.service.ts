import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const getSizeMb = (number: number) => {
  return number * 1024 * 1024;
};

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  /**
   * Validates the uploaded image based on type and size.
   * @param file - The image file to validate, provided by the `@UploadedFile` decorator.
   * @throws BadRequestException if validation fails.
   * @returns The file if it passes validation.
   */
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/svg',
      'image/webp',
    ];
    const maxSize = getSizeMb(5);

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file image');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size is too big');
    }

    return file;
  }
}
