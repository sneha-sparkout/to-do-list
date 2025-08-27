import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/task/schema/task.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as nodemailer from 'nodemailer';
import { log } from 'console';

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
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async sendSummary(){
    const today = Date.now();
    const start = new Date(today)
    start.setHours(0,0,0,0)
    const end = new Date();
    end.setHours(23,59,59,999)
    //task
    const tasks = await this.taskModel.find({
      deadline: {$gte: start, $lte: end}
    }).populate<{ user: UserDocument }>('user');
    //user
    const getUser = new Map<string, TaskDocument[]>();
    for(const task of tasks){
      const user = task.user as any;
      const userId = user._id.toString();
      if(!getUser.has(userId)) getUser.set(userId, [])
        getUser.get(userId)!.push(task as unknown as TaskDocument & {user: UserDocument})
    }
    //summary
    for (const tasks of getUser.values()) {
      const user = tasks[0].user as unknown as UserDocument;
      const taskList = tasks.map(t => `${t.title}${t.status}`)
      await this.sendMail(
        user.email,
        `Your Task Summary for Today`,
        `Here is your todays task ${taskList}`
      )
      this.logger.log(`summary sent ${user.email}`)
    }

  }

  private async sendMail(to: string, subject: string, text: string){
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