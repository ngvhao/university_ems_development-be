import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueMessage } from 'src/utils/interfaces/queue.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueConsumer.name);
  private isConsuming: boolean = false;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // this.startConsuming();
  }

  onModuleDestroy() {
    this.stopConsuming();
  }

  private async startConsuming() {
    this.isConsuming = true;
    const queueUrl = this.configService.get<string>(
      'QUEUE_STUDENT_CREATION_URL',
    );

    while (this.isConsuming) {
      try {
        const messages = await this.queueService.receiveMessages(queueUrl);
        if (messages.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        for (const message of messages) {
          try {
            const messageBody = JSON.parse(message.Body) as QueueMessage;
            await this.handleMessage(messageBody);
            await this.queueService.deleteMessage(
              queueUrl,
              message.ReceiptHandle,
            );
          } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error receiving messages: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  private async stopConsuming() {
    this.isConsuming = false;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  private async handleMessage(messageBody: QueueMessage) {
    if (messageBody.status === 'processed') {
      this.logger.warn(
        `Message already processed, skipping: ${messageBody.type}`,
      );
      return;
    }

    this.logger.log(`Processing message: ${JSON.stringify(messageBody)}`);

    try {
      if (messageBody.type === 'student-enrollment') {
        // await this.enrollmentCourseService.create(messageBody.data);
        this.logger.log(`Created student: ${messageBody.type}`);
      } else if (messageBody.type === 'course-registration') {
        console.log('Registration course');
        // await this.courseService.createStudent(messageBody.data);
        this.logger.log(`Registered course: ${messageBody.type}`);
      } else {
        throw new Error(`Unknown message type: ${messageBody.type}`);
      }

      //   // Gửi thông báo đến hàng đợi khác
      //   const notificationQueueUrl = this.configService.get<string>(
      //     'AWS_SQS_NOTIFICATION_QUEUE_URL',
      //   );
      //   await this.queueProducer.produce(notificationQueueUrl, {
      //     type: messageBody.type,
      //     type: 'notification',
      //     data: { action: 'processed', originalType: messageBody.type },
      //   });
    } catch (error) {
      this.logger.error(
        `Error processing message ${messageBody.type}: ${error.message}`,
      );
      throw error;
    }
  }
}
