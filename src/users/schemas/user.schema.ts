import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserRole } from "src/common/roles.enum";

export type UserDocument = User & Document

@Schema({ timestamps: true })

export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, trim: true})
    password: string;

    @Prop()
    kycUrl?: string;

    @Prop({
    enum: ['approved' , 'rejected' , 'pending'], default: 'pending'})
    status?: string;

    @Prop({ enum: UserRole, default: UserRole.USER})
    role: UserRole;

    @Prop({ default: false })
    isBlocked?: boolean

}
export const UserSchema = SchemaFactory.createForClass(User)