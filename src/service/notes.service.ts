import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entitys/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
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
    return this.notesRepository.save(newNote);
  }
}
