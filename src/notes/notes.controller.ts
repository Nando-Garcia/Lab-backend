import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotesService } from '../service/notes.service';
import { Note } from '../entitys/note.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getNotes(@Request() req: any): Promise<Note[] | { mensaje: string }> {
    return this.notesService.findAllByUser(req.user.userId);
  }

  @Post()
  createNote(
    @Body() note: { title: string; content: string },
    @Request() req: any,
  ): Promise<Note> {
    return this.notesService.create(note, req.user.userId);
  }
}

