import { Injectable } from '@nestjs/common';
import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {
  QueueMessage,
  SendMessageOptions,
} from 'src/utils/interfaces/queue.interface';
import { QueueConfigService } from './queue.config';

@Injectable()
export class QueueService {
  private readonly sqs: SQSClient;

  constructor(private readonly queueConfigService: QueueConfigService) {
    this.sqs = this.queueConfigService.createSQSClient();
  }

  async sendMessage(
    queueUrl: string,
    messageBody: QueueMessage,
    options: SendMessageOptions = {},
  ): Promise<string> {
    const { isFifo = false, groupId } = options;

    if (isFifo && !groupId) {
      throw new Error('MessageGroupId is required for FIFO queues');
    }

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      ...(isFifo && groupId ? { MessageGroupId: groupId } : {}),
    });

    const result = await this.sqs.send(command);
    console.log(`Sent message to ${queueUrl}: ${result.MessageId}`);
    return result.MessageId!;
  }

  async receiveMessages(queueUrl: string) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    });

    const result = await this.sqs.send(command);
    return result.Messages || [];
  }

  async deleteMessage(queueUrl: string, receiptHandle: string) {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqs.send(command);
  }
}
