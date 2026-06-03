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
      endpoint: (process.env.LOCALSTACK_ENDPOINT) as string,
      credentials: {
        //accessKeyId: 'test',
        accessKeyId: (process.env.AWS_ACCESS_KEY_ID) as string,
        //secretAccessKey: 'test',
        secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY) as string,
      },
    });
  }

  async sendNoteCreatedEvent(noteId: number, userId: number): Promise<void> {
    try {
      const message = {
        event: 'NOTE_CREATED',
        noteId,
        userId,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`[SQS_MESSAGE_SEND_START] noteId=${noteId}, userId=${userId}`, {
        context: 'SqsProducerService.sendNoteCreatedEvent',
        noteId,
        userId,
        event: message.event,
      });

      const command = new SendMessageCommand({
        QueueUrl: this.sqsConfig.queueUrl,
        MessageBody: JSON.stringify(message),
      });

      const result = await this.client.send(command);

      this.logger.log(
        `[SQS_MESSAGE_SENT] Mensaje enviado correctamente`,
        {
          context: 'SqsProducerService.sendNoteCreatedEvent',
          messageId: result.MessageId,
          noteId,
          userId,
          timestamp: message.timestamp,
        },
      );
    } catch (error) {
      this.logger.error(
        `[SQS_MESSAGE_SEND_FAILED] Error enviando mensaje a SQS`,
        {
          context: 'SqsProducerService.sendNoteCreatedEvent',
          noteId,
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw error;
    }
  }
}
