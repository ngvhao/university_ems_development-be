import { Module } from '@nestjs/common';

import { DriveController } from './drive.controller';
import { FileValidationPipe } from './fileValidation.service';
import { ImageValidationPipe } from './imageValidation.service';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [DriveController],
  providers: [S3Service, ImageValidationPipe, FileValidationPipe],
})
export class DriveModule {}
