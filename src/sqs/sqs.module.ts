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
          region: (process.env.AWS_REGION || 'us-east-1') as string,
          endpoint: (process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566') as string,
          credentials: {
            accessKeyId: (process.env.AWS_ACCESS_KEY_ID || 'test') as string,
            secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || 'test') as string,
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
