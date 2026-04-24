import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsProducerService {
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private readonly logger = new Logger(SqsProducerService.name);

  constructor() {
    this.client = new SQSClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    this.queueUrl =
      'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/notes-queue';
  }

  async sendNoteCreatedEvent(noteId: number, userId: number): Promise<void> {
    const message = {
      event: 'NOTE_CREATED',
      noteId,
      userId,
      timestamp: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    });

    const result = await this.client.send(command);
    this.logger.log(
      `[SQS Producer] Mensaje enviado. MessageId: ${result.MessageId} | noteId: ${noteId} | userId: ${userId}`,
    );
  }
}
