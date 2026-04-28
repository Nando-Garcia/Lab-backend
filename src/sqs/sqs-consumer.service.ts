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
    this.logger.log('[SQS Consumer] Worker iniciado, escuchando notes-queue...');
    this.poll();
  }

  onModuleDestroy() {
    this.isRunning = false;
    this.logger.log('[SQS Consumer] Worker detenido.');
  }

  private async poll(): Promise<void> {
    while (this.isRunning) {
      console.log("Escuchando... Preguntando si hay mensaje cada 5s.")
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.sqsConfig.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 5, // long polling: espera hasta 5s si no hay mensajes (reduce llamadas vacías)
        });

        const response = await this.client.send(command);

        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            await this.processMessage(message);
          }
        }
      } catch (error) {
        this.logger.error('[SQS Consumer] Error en el polling:', error);
        // Espera 5s antes de reintentar para no saturar en caso de error
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
        `[SQS Consumer] Evento recibido: ${body.event} | noteId: ${body.noteId} | userId: ${body.userId} | timestamp: ${body.timestamp}`,
      );

      // Eliminar el mensaje de la cola (sin esto SQS lo reintenta y tras 3 fallos va a DLQ)
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.sqsConfig.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );

      this.logger.log(
        `[SQS Consumer] Mensaje procesado y eliminado. MessageId: ${message.MessageId}`,
      );
    } catch (error) {
      // No eliminamos el mensaje: SQS lo reintentará hasta maxReceiveCount (3), luego va a DLQ
      this.logger.error(
        `[SQS Consumer] Error procesando mensaje ${message.MessageId}:`,
        error,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
