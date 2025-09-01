import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/task/schema/task.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as nodemailer from 'nodemailer';
import path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}
  //1.sending reminder
  @Cron(CronExpression.EVERY_5_MINUTES)
  async createReminder(){
    console.log('Now:', new Date());
    const now = Date.now();
    const setReminder = new Date(now + 60 * 60 * 1000)
    const tasks = await this.taskModel.find({
      deadline: {$gte:now, $lte: setReminder},
      reminderSent: { $ne: true },
    }).populate<{ user: UserDocument }>('user');
    console.log('Tasks found:', tasks.length);
    for(const task of tasks){
      if(!task.deadline) continue;
      this.logger.log(`sending email ${task.user.email} for ${task.title}`)
      console.log('Sending email to:', task.user.email);
      await this.sendMail(
        task.user.email,
        `REMINDER FOR ${task.title} BEFORE ${task.deadline}`,
        `Hi this is a reminder to complete your task before deadline`
      );
      task.reminderSent = true;
      await task.save()
    }
  }
  //2.get summary(task, user, email)
  @Cron('30 12 * * 1-6')
  async sendSummary(email: string){
    const now = new Date();
    const IST_OFFSET = 5.5 * 60;
    const toIST = (date: Date) => {
      const utc = date.getTime() + date.getTimezoneOffset() * 6000;
      return new Date(utc + IST_OFFSET * 6000)
    }
    const startIST = toIST(new Date(now));
    startIST.setHours(0,0,0,0)
    const endIST = toIST(new Date());
    endIST.setHours(23,59,59,999)
    //user
    const user = await this.userModel.findOne({ email }).populate<{tasks: TaskDocument[]}>({
      path: 'tasks',
      match: {deadline: { $gte: startIST, $lte: endIST} }
    })
    if(!user) {
      this.logger.log(`not task asigned ${user}`)
      return;
    }
    //summary
      const taskList = user.tasks
      .map(t => `${t.title}${t.status}`)
      await this.sendMail(
        user.email,
        `Your Task Summary for Today`,
        `Here is your todays task ${taskList}`
      )
      this.logger.log(`summary sent ${user.email}`)
    }
    async sendMail(to: string, subject: string, text: string){
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    })
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log('message sent', info.messageId);
  }

  }


