import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotesService } from '../service/notes.service';
import { Note } from '../entitys/note.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getNotes(): Promise<Note[] | { mensaje: string }> {
    return this.notesService.findAll();
  }

  @Post()
  createNote(@Body() note: { title: string; content: string }): Promise<Note> {
    return this.notesService.create(note);
  }
}

