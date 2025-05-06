import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { QueueConfigService } from './queue.config';
import { QueueMessage } from 'src/utils/interfaces/queue.interface';

@Injectable()
export class QueueService {
  private sqs: AWS.SQS;

  constructor(private readonly queueConfigService: QueueConfigService) {
    this.sqs = this.queueConfigService.createSQSClient();
  }

  async sendMessage(
    queueUrl: string,
    messageBody: QueueMessage,
  ): Promise<AWS.SQS.SendMessageResult> {
    try {
      const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
      };
      const result = await this.sqs.sendMessage(params).promise();
      console.log(`Sent message to ${queueUrl}: ${result.MessageId}`);
      return result;
    } catch (error) {
      console.error(`Error sending message to ${queueUrl}: ${error.message}`);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async receiveMessages(queueUrl: string): Promise<AWS.SQS.Message[]> {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    const result = await this.sqs.receiveMessage(params).promise();
    return result.Messages || [];
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    await this.sqs.deleteMessage(params).promise();
  }
}
