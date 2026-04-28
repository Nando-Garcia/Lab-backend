import { Module } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { SqsProducerService } from './sqs-producer.service';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  providers: [
    {
      provide: 'SQS_CONFIG',
      useFactory: async () => {
        const client = new SecretsManagerClient({
          region: 'us-east-1',
          endpoint: 'http://localhost:4566',
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          },
        });
        const response: any = await client.send(
          new GetSecretValueCommand({ SecretId: 'sqs/config' }),
        );
        return JSON.parse(response.SecretString);
      },
    },
    SqsProducerService,
    SqsConsumerService,
  ],
  exports: [SqsProducerService],
})
export class SqsModule {}
