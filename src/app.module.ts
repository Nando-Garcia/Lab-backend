import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { SqsModule } from './sqs/sqs.module';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const client = new SecretsManagerClient({
          region: (process.env.AWS_REGION) as string,
          endpoint: (process.env.LOCALSTACK_ENDPOINT) as string,
          credentials: {
            accessKeyId: (process.env.AWS_ACCESS_KEY_ID) as string,
            secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY) as string,
          },
        });

        const response : any = await client.send(
          new GetSecretValueCommand({ SecretId: process.env.DB_CREDENTIALS_SECRET_ID }),
        );

        const dbCredentials = JSON.parse(response.SecretString);

        return {
          type: 'postgres',
          host: dbCredentials.host,
          port: dbCredentials.port,
          username: dbCredentials.username,
          password: dbCredentials.password,
          database: dbCredentials.database,
          autoLoadEntities: true,
          synchronize: true, // solo para desarrollo, crea las tablas automáticamente
        };
      },
    }),
    NotesModule,
    AuthModule,
    SqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
