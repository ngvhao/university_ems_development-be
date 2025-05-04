import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueMessage } from 'src/utils/interfaces/queue.interface';

@Injectable()
export class QueueProducer {
  constructor(private readonly queueService: QueueService) {}

  async produce(queueUrl: string, messageBody: QueueMessage): Promise<void> {
    await this.queueService.sendMessage(queueUrl, messageBody);
  }
}
