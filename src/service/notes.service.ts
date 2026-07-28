import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entitys/note.entity';
import { SqsProducerService } from '../sqs/sqs-producer.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly sqsProducer: SqsProducerService,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      endpoint: process.env.LOCALSTACK_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: (process.env.AWS_ACCESS_KEY_ID) as string,
        secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY) as string,
      },
    });
    this.bucketName = process.env.S3_BUCKET as string;
  }

  async findAllByUser(userId: number): Promise<Note[] | { mensaje: string }> {
    try {
      this.logger.log(`[NOTES_FIND_START] userId=${userId}`, {
        context: 'NotesService.findAllByUser',
        userId,
      });

      const notes = await this.notesRepository.find({ where: { userId } });

      if (notes.length === 0) {
        this.logger.warn(`[NOTES_FIND_EMPTY] userId=${userId}`, {
          context: 'NotesService.findAllByUser',
          userId,
        });
        return { mensaje: 'no hay mensajes' };
      }

      this.logger.log(`[NOTES_FIND_SUCCESS] userId=${userId}, count=${notes.length}`, {
        context: 'NotesService.findAllByUser',
        userId,
        count: notes.length,
      });

      return notes;
    } catch (error: any) {
      this.logger.error(`[NOTES_FIND_FAILED] userId=${userId}`, {
        context: 'NotesService.findAllByUser',
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  async create(note: { title: string; content: string }, userId: number): Promise<Note> {
    try {
      this.logger.log(`[NOTE_CREATE_START] userId=${userId}, titleLength=${note.title.length}`, {
        context: 'NotesService.create',
        userId,
        titleLength: note.title.length,
      });

      const newNote = this.notesRepository.create({ ...note, userId });
      const savedNote = await this.notesRepository.save(newNote);

      this.logger.log(`[NOTE_CREATE_SUCCESS] noteId=${savedNote.id}, userId=${userId}`, {
        context: 'NotesService.create',
        userId,
        noteId: savedNote.id,
      });

      return savedNote;
    } catch (error: any) {
      this.logger.error(`[NOTE_CREATE_FAILED] userId=${userId}`, {
        context: 'NotesService.create',
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async attachFile(noteId: number, userId: number, file: Express.Multer.File): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { id: noteId, userId } });
    if (!note) {
      throw new NotFoundException(`Note ${noteId} not found for user ${userId}`);
    }

    const ext = file.originalname.split('.').pop();
    const key = `${userId}/${noteId}/${randomUUID()}.${ext}`;

    this.logger.log(`[S3_UPLOAD_START] noteId=${noteId}, key=${key}`);

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const fileUrl = `${process.env.LOCALSTACK_ENDPOINT}/${this.bucketName}/${key}`;
    this.logger.log(`[S3_UPLOAD_SUCCESS] noteId=${noteId}, fileUrl=${fileUrl}`);

    note.fileUrl = fileUrl;
    const updated = await this.notesRepository.save(note);

    // Fire & forget: Lambda procesa el evento de forma asíncrona
    void this.sqsProducer.sendFileAttachedEvent(noteId, userId, fileUrl);

    return updated;
  }
}
