import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, UploadedFile, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/kyc',
      filename(req, file, callback) {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName)
      },
    })
  }))
  uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File){
    const userId = req.user._id
    const fileUrl = `./uploads/kyc${file.filename}`;
    return this.usersService.uploadDocuments(fileUrl, userId)
  }

  @Get('/check-status/:id')
  @UseGuards(JwtAuthGuard)
  checkDocumentStatus(@Param('id') id: string){
    return this.usersService.checkStatus(id)
  }
}


