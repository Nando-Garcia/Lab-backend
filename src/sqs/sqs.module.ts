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
          region: (process.env.AWS_REGION) as string,
          endpoint: (process.env.LOCALSTACK_ENDPOINT) as string,
          credentials: {
            accessKeyId: (process.env.AWS_ACCESS_KEY_ID) as string,
            secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY) as string,
          },
        });
        const response: any = await client.send(
          new GetSecretValueCommand({ SecretId: process.env.SQS_CONFIG_SECRET_ID }),
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
