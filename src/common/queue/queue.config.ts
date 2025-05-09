import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

@Injectable()
export class QueueConfigService {
  constructor() {}

  createSQSClient(): AWS.SQS {
    // return QueueConfig.isLocalstack
    //   ? new AWS.SQS({
    //       region: AWSConstants.REGION,
    //       endpoint: QueueConfig.isLocalstack
    //         ? QueueConfig.LOCALSTACK_ENDPOINT
    //         : undefined,
    //       credentials: QueueConfig.isLocalstack
    //         ? {
    //             accessKeyId: 'test',
    //             secretAccessKey: 'test',
    //           }
    //         : undefined,
    //     })
    //   : new AWS.SQS();
    return new AWS.SQS();
  }
}
