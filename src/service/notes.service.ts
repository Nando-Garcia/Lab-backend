import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entitys/note.entity';
import { SqsProducerService } from '../sqs/sqs-producer.service';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly sqsProducer: SqsProducerService,
  ) {}

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
    } catch (error) {
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

      // Fire & forget: no bloqueamos la respuesta al usuario esperando SQS
      void this.sqsProducer.sendNoteCreatedEvent(savedNote.id, userId);

      return savedNote;
    } catch (error) {
      this.logger.error(`[NOTE_CREATE_FAILED] userId=${userId}`, {
        context: 'NotesService.create',
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
