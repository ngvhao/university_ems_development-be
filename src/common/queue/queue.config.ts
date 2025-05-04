import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';

@Injectable()
export class QueueConfigService {
  constructor(private readonly configService: ConfigService) {}

  createSQSClient(): AWS.SQS {
    const isLocalstack = this.configService.get<boolean>(
      'QUEUE_USE_LOCALSTACK',
    );
    const region = this.configService.get<string>('AWS_REGION');
    const endpoint = this.configService.get<string>('LOCALSTACK_ENDPOINT');

    return new AWS.SQS({
      region,
      endpoint: isLocalstack ? endpoint : undefined,
      credentials: isLocalstack
        ? {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          }
        : undefined,
    });
  }
}
