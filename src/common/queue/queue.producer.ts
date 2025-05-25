import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';
import {
  QueueMessage,
  SendMessageOptions,
} from 'src/utils/interfaces/queue.interface';

@Injectable()
export class QueueProducer {
  constructor(private readonly queueService: QueueService) {}

  async produce(
    queueUrl: string,
    messageBody: QueueMessage,
    options: SendMessageOptions = {},
  ): Promise<void> {
    console.log('produce@@@sendQueue: ', messageBody);
    await this.queueService.sendMessage(queueUrl, messageBody, options);
  }
}
