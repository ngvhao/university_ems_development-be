import { forwardRef, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProducer } from './queue.producer';
import { QueueConfigService } from './queue.config';
import { QueueConsumer } from './queue.consumer';
import { ConfigService } from '@nestjs/config';
import { StudentModule } from 'src/modules/student/student.module';

@Module({
  imports: [forwardRef(() => StudentModule)],
  providers: [
    QueueService,
    QueueProducer,
    QueueConsumer,
    QueueConfigService,
    ConfigService,
  ],
  exports: [QueueService, QueueProducer, QueueConsumer, QueueConfigService],
})
export class QueueModule {}
