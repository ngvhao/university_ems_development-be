import {
  Body,
  Controller,
  Post,
  UseGuards,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { FileValidationPipe } from './fileValidation.service';
import { ImageValidationPipe } from './imageValidation.service';
import { S3Service } from './s3.service';
import { SuccessResponse } from 'src/utils/response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
  constructor(private readonly s3service: S3Service) {}

  /**
   * Endpoint to upload an image file to S3.
   * @param file - The image file to upload, validated by ImageValidationPipe.
   * @param path - The path within the S3 bucket where the file will be stored.
   * @param res - Express response object used for sending the response.
   * @returns Success response with file upload data.
   */
  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileImage(
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
    @Body('path') path: string,
    @Res() res: Response,
  ) {
    const data = await this.s3service.uploadFileImage(file, path);

    return new SuccessResponse({ data: data }).send(res);
  }

  /**
   * Endpoint to upload a general file (non-image) to S3.
   * @param file - The file to upload, validated by FileValidationPipe.
   * @param path - The path within the S3 bucket where the file will be stored.
   * @param res - Express response object used for sending the response.
   * @returns Success response with file upload data.
   */
  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body('path') path: string,
    @Res() res: Response,
  ) {
    const data = await this.s3service.uploadFile(file, path);
    return new SuccessResponse({ data: data }).send(res);
  }
}
