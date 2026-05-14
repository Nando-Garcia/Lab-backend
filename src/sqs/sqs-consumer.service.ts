import { Injectable, Inject, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

interface SqsConfig {
  queueUrl: string;
  dlqUrl: string;
  region: string;
}

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly client: SQSClient;
  private readonly logger = new Logger(SqsConsumerService.name);
  private isRunning = false;

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

  onModuleInit() {
    this.isRunning = true;
    this.logger.log('[SQS_CONSUMER_STARTED] Worker iniciado, escuchando notes-queue...', {
      context: 'SqsConsumerService.onModuleInit',
      queueUrl: this.sqsConfig.queueUrl,
    });
    this.poll();
  }

  onModuleDestroy() {
    this.isRunning = false;
    this.logger.log('[SQS_CONSUMER_STOPPED] Worker detenido.', {
      context: 'SqsConsumerService.onModuleDestroy',
    });
  }

  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.sqsConfig.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5, // long polling: espera hasta 5s si no hay mensajes
        });

        const response = await this.client.send(command);

        if (response.Messages && response.Messages.length > 0) {
          this.logger.log(
            `[SQS_MESSAGES_RECEIVED] Recibidos ${response.Messages.length} mensajes`,
            {
              context: 'SqsConsumerService.poll',
              messageCount: response.Messages.length,
            },
          );

          for (const message of response.Messages) {
            await this.processMessage(message);
          }
        }
      } catch (error) {
        this.logger.error('[SQS_POLLING_ERROR] Error en el polling de mensajes', {
          context: 'SqsConsumerService.poll',
          error: error.message,
          stack: error.stack,
        });
        await this.sleep(5000);
      }
    }
  }

  private async processMessage(message: any): Promise<void> {
    // throw new Error('Fallo simulado solo para prueba de DLQ'); // temporal, solo para probar DLQ VisibilityTimeout  debe estar en 0 no en 30
    try {
      const body = JSON.parse(message.Body);

      // --- Solo logs en esta rama ---
      // En rama feature/s3-attachments: aquí se generará el backup en S3
      // En rama feature/sqs-to-lambda: este bloque se extrae a una Lambda.
      this.logger.log(
        `[SQS_MESSAGE_PROCESSING] Evento: ${body.event} | noteId: ${body.noteId} | userId: ${body.userId}`,
        {
          context: 'SqsConsumerService.processMessage',
          messageId: message.MessageId,
          event: body.event,
          noteId: body.noteId,
          userId: body.userId,
          timestamp: body.timestamp,
        },
      );

      // Eliminar el mensaje de la cola (sin esto SQS lo reintenta y tras 3 fallos va a DLQ)
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.sqsConfig.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );

      this.logger.log(
        `[SQS_MESSAGE_DELETED] Mensaje procesado y eliminado`,
        {
          context: 'SqsConsumerService.processMessage',
          messageId: message.MessageId,
        },
      );
    } catch (error) {
      // No eliminamos el mensaje: SQS lo reintentará hasta maxReceiveCount (3), luego va a DLQ
      this.logger.error(
        `[SQS_MESSAGE_ERROR] Error procesando mensaje ${message.MessageId}`,
        {
          context: 'SqsConsumerService.processMessage',
          messageId: message.MessageId,
          error: error.message,
          stack: error.stack,
        },
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
