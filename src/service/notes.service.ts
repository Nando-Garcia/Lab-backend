import { Injectable } from '@nestjs/common';

export interface Note {
  id: number;
  title: string;
  content: string;
}

@Injectable()
export class NotesService {
  private notes: Note[] = [];
  private nextId = 1;

  findAll(): any {
    if (this.notes.length === 0) {
      return { mensaje: "no hay mensajes" };
    }
    return this.notes;
  }

  create(note: Omit<Note, 'id'>): Note {
    const newNote = { id: this.nextId++, ...note };
    this.notes.push(newNote);
    console.log('Nota creada y guardada en el arreglo, proximamente en S3 y BD PostgreSQL:', newNote);
    return newNote;
  }
}