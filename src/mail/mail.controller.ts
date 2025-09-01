import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from './mail.service';


@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

    @Get('send-reminder')
    async sendReminder (){
      return this.mailService.createReminder();
    }
    
    @Post('send-summary')
    async sendSummary(@Body('email') email: string) {
    return this.mailService.sendSummary(email);
    }
  }



