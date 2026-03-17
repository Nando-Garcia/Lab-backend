import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotesService } from '../service/notes.service';

@Controller('notes')
export class NotesController {
    constructor(private readonly notesService: NotesService) {}

  @Get()
  getNotes() {
    return this.notesService.findAll();
  }

  @Post()
  createNote(@Body() note: { title: string; content: string }) {
    return this.notesService.create(note);
  }


}

