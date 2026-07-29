import {
  Controller, Get, Post, Body, UseGuards, Request,
  Param, ParseIntPipe, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NotesService } from '../service/notes.service';
import { Note } from '../entities/note.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';

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
    @Body() note: CreateNoteDto,
    @Request() req: any,
  ): Promise<Note> {
    return this.notesService.create(note, req.user.userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  attachFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<Note> {
    return this.notesService.attachFile(id, req.user.userId, file);
  }
}

