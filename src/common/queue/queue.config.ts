import { SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueConfigService {
  constructor() {}

  createSQSClient(): SQSClient {
    return new SQSClient({});
  }
}
