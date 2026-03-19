import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesModule } from './notes/notes.module';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const client = new SecretsManagerClient({
          region: 'us-east-1',
          endpoint: 'http://localhost:4566',
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          },
        });

        const response : any = await client.send(
          new GetSecretValueCommand({ SecretId: 'notesdb/credentials' }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
