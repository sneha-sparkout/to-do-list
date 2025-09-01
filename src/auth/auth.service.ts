import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor (@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  private readonly jwtService: JwtService) {}

  async signUp(createDto: CreateUserDto): Promise<UserDocument>{
    const { email, password } = createDto;
    if (!email || !password) throw new Error('please fill all fields')
    const existingUser = await this.userModel.findOne({ email })
    if (existingUser) throw new ConflictException('email already exists')
      const hasshedPassword = await bcrypt.hash( password, 10)
    const newUser = new this.userModel({
      ...createDto,
      password: hasshedPassword,
    })
    return newUser.save()
  }

  async login(email: string, password: string){
    const user = await this.userModel.findOne({ email }).select('-password')
    if(!user) throw new NotFoundException('user not found');
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) throw new UnauthorizedException('Invalid Credential')
     const payload = { sub: user._id, role: user.role };
    const token = await this.jwtService.signAsync(payload)
    return {
      access_token: token
    }
  }
}
