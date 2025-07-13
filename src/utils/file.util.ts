import { BadRequestException } from '@nestjs/common';

export class FileUtil {
  static validateFilePath(path: string, type: string) {
    let pathFormatted: string;
    const invalidPathPattern = /^[<>:"/\\|?*]|[<>:"/\\|?*]$|[^a-zA-Z0-9/-]/;
    if (path === '') {
      pathFormatted = `upload/${type}`;
      return pathFormatted;
    }
    if (invalidPathPattern.test(path)) {
      throw new BadRequestException(
        'Invalid file path. Path contains special characters.',
      );
    }

    pathFormatted = `upload/${type}/${path}`;
    return pathFormatted;
  }
}
