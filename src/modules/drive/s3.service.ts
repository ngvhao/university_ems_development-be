import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { FileUtil } from 'src/utils/file.util';
import { StringUtil } from 'src/utils/string.util';

@Injectable()
export class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({});
  }

  /**
   * Uploads an image file to the specified S3 bucket and returns its details.
   * @param file - The file to upload (from Express.Multer).
   * @param path - The path within the bucket where the file will be stored.
   * @returns An object containing the file's URL, path, and MIME type.
   */
  async uploadFileImage(
    file: Express.Multer.File,
    path: string,
  ): Promise<{ url: string; path: string; mimetype: string }> {
    const pathValidated = FileUtil.validateFilePath(path, 'images');

    const randomFileName = StringUtil.generateRandomFileName(
      file.originalname,
      12,
    );

    const pathName = `${pathValidated}/${randomFileName}`;

    const parameters = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: pathName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(parameters);
      await this.s3.send(command);

      return {
        url: `${process.env.AWS_S3_BUCKET_URL}/${pathName}`,
        path: pathName,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Uploads a general file (non-image) to the specified S3 bucket and returns its details.
   * @param file - The file to upload (from Express.Multer).
   * @param path - The path within the bucket where the file will be stored.
   * @returns An object containing the file's URL, path, and MIME type.
   */
  async uploadFile(
    file: Express.Multer.File,
    path: string,
  ): Promise<{ url: string; path: string; mimetype: string }> {
    const pathValidated = FileUtil.validateFilePath(path, 'files');

    const randomFileName = StringUtil.generateRandomFileName(
      file.originalname,
      12,
    );

    const pathName = `${pathValidated}/${randomFileName}`;

    const parameters = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: pathName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(parameters);
      await this.s3.send(command);

      return {
        url: `${process.env.AWS_S3_BUCKET_URL}/${pathName}`,
        path: pathName,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }
}
