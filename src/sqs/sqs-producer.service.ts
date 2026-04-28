import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

interface SqsConfig {
  queueUrl: string;
  dlqUrl: string;
  region: string;
}

@Injectable()
export class SqsProducerService {
  private readonly client: SQSClient;
  private readonly logger = new Logger(SqsProducerService.name);

  constructor(@Inject('SQS_CONFIG') private readonly sqsConfig: SqsConfig) {
    this.client = new SQSClient({
      region: sqsConfig.region,
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async sendNoteCreatedEvent(noteId: number, userId: number): Promise<void> {
    const message = {
      event: 'NOTE_CREATED',
      noteId,
      userId,
      timestamp: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      QueueUrl: this.sqsConfig.queueUrl,
      MessageBody: JSON.stringify(message),
    });

    const result = await this.client.send(command);
    this.logger.log(
      `[SQS Producer] Mensaje enviado. MessageId: ${result.MessageId} | noteId: ${noteId} | userId: ${userId}`,
    );
  }
}
