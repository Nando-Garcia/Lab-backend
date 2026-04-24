import { Module } from '@nestjs/common';
import { SqsProducerService } from './sqs-producer.service';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  providers: [SqsProducerService, SqsConsumerService],
  exports: [SqsProducerService],
})
export class SqsModule {}
