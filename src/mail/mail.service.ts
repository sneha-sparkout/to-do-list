import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from 'src/task/schema/task.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  private toIST(date: Date) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 5.5 * 60 * 60000);
  }

  private async sendMail(to: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });

    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    this.logger.log(`email ${to}: ${info.messageId}`);
  }

  @Cron('0 19 * * 6')
  async sendWeeklySummary() {
    try {
      const users = await this.userModel.find();
      if (!users.length) {
        this.logger.warn('user not found');
        return;
      }
      const admins = await this.userModel.find({ role: 'admin' });

      for (const user of users) {
        const tasks = await this.taskModel.find({ user: user._id });
        const taskList = (tasks || [])
          .map((t, i) => {
          const deadline = this.toIST(new Date(t.deadline!)).toLocaleString('en-IN');
            return `${i + 1}. ${t.title } - Status: ${t.status} - Deadline: ${deadline}`;
          })
        await this.sendMail(user.email, 'Your Weekly Task Summary', `Helo ${user.email}Your tasks${taskList}`);
        this.logger.log(`Summary sent to user: ${user.email}`);
      }

      let adminSummary = '';
      for (const user of users) {
        const tasks = await this.taskModel.find({ user: user._id });
        const taskList = (tasks || [])
          .map((t, i) => {
            const deadline = t.deadline ? this.toIST(new Date(t.deadline)).toLocaleString('en-IN') : 'No deadline';
            return `${i + 1}. ${t.title } - Status: ${t.status } - Deadline: ${deadline}`;
          })
        adminSummary += `User: ${user.email}${taskList}`;
      }

      for (const admin of admins) {
        await this.sendMail(admin.email, 'all user weekly summary', adminSummary);
        this.logger.log(`summary sent to admin: ${admin.email}`);
      }

      this.logger.log('mail sent successfully.');
    } catch (err) {
      this.logger.error('error sending summaries:', err);
    }
  }
}
