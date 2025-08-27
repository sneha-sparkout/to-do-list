import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
    constructor (@InjectModel(User.name) private readonly userModel: Model <UserDocument>) {}
  async uploadDocuments(documentUrl: string, userId: string): Promise<UserDocument>{
    const user = await this.userModel.findByIdAndUpdate(
        userId,
        {kycUrl: documentUrl}
    )
    if(!user) throw new NotFoundException('user not found')
        return user;
  }
  async checkStatus(userId: string): Promise<UserDocument>{
    const user = await this.userModel.findById(userId).select('status').select('-password')
    if(!user) throw new UnauthorizedException("user not found")
    return user;
}
}
