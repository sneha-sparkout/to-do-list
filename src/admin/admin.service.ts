import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';



@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)
  constructor (@InjectModel(User.name) private readonly userModel: Model<UserDocument>,

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

}
