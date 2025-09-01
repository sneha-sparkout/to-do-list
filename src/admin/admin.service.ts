import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { promises } from 'dns';
import { MailService } from 'src/mail/mail.service';
import { TaskDocument } from 'src/task/schema/task.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)
  constructor (@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  private  mailService: MailService
) {}

  async findAll(): Promise<UserDocument[]>{
    return await this.userModel.find().exec()
  }
  async reviewDocuments(userId: string): Promise<UserDocument>{
    const findDocument = await this.userModel.findOne({_id: userId}).select('kycUrl')
    if(!findDocument) throw new NotFoundException('document not found')
    return findDocument
  }
  async documentStatus(userId: string, status: 'approved' | 'rejected' | 'pending'): Promise<UserDocument>{
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {status},
    )
    if(!user) throw new NotFoundException('user not found')
    return user;
  }
  async accessUserDetail(userId: string):Promise<UserDocument>{
    const accessUser = await this.userModel
    .findById(userId)
    .select('email kycUrl role status')
    .select('-password')
    .exec()
    if(!accessUser) throw new NotFoundException('document not found')
    return accessUser;
  }
  async blockUnblockUser(userId: string, isBlocked: boolean): Promise<UserDocument>{
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {isBlocked},
      {new: true})
    if(!user) throw new NotFoundException('document not found')
     return user
  }
  async adminSummary(){
    const now = Date.now();
    const IST_OFFSET = 5.5 * 60;
    const toIST = (date: Date) => new Date(date.getTime() + IST_OFFSET * 6000);
    const startIST = toIST(new Date(now))
    startIST.setHours(0,0,0,0)
    const endIST = toIST(new Date())
    endIST.setHours(23, 59, 59, 999)
    const users = await this.userModel
    .find()
    .populate<{tasks: TaskDocument[]}>({
      path: 'tasks',
      match: { deadline: { $gte: startIST, $lte: endIST }}
    })
    const createAdminSummary: string[] = [];
    for(const user of users) {
      const taskList = user.tasks
      .map(t=> `${user} -${t.title} [${t.status}]`)
      createAdminSummary.push(`${user}: ${taskList}`)
    }
    if (createAdminSummary.length) {
      await this.mailService.sendMail(
        'dsneha960@gmail.com',
        'daily tasks of user',
        createAdminSummary.join()
      )
      this.logger.log('Admin summary sent')
    }
  }
}
