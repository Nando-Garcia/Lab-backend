import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entitys/note.entity';
import { SqsProducerService } from '../sqs/sqs-producer.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly sqsProducer: SqsProducerService,
  ) {}

  async findAllByUser(userId: number): Promise<Note[] | { mensaje: string }> {
    const notes = await this.notesRepository.find({ where: { userId } });
    if (notes.length === 0) {
      return { mensaje: 'no hay mensajes' };
    }
    return notes;
  }

  async create(note: { title: string; content: string }, userId: number): Promise<Note> {
    const newNote = this.notesRepository.create({ ...note, userId });
    const savedNote = await this.notesRepository.save(newNote);

    // Fire & forget: no bloqueamos la respuesta al usuario esperando SQS
    void this.sqsProducer.sendNoteCreatedEvent(savedNote.id, userId);

    return savedNote;
  }
}
