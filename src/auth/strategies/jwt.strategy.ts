import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User, UserDocument } from "src/users/schemas/user.schema";

@Injectable()
export class Jwtstrategy extends PassportStrategy(Strategy){
    constructor (@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService) {
        super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
           secretOrKey: configService.get<string>('JWT_SECRET')!
        })
    }
    async validate(payload: any) {
        const user = await this.userModel.findById(payload.sub).select('-password')
        if(!user) throw new UnauthorizedException('user not found')
            return user;
    }
}
