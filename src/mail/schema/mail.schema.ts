import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type MailSchema = Mail & Document

@Schema({ timestamps: true })

export class Mail{
    @Prop({ ref: 'User', type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ ref: 'task', type: Types.ObjectId})
    tasks: Types.ObjectId

    @Prop({ type: Date })
    reminderTime?: Date

    @Prop()
    taskSummary?: string[]
}
export const MailSchema = SchemaFactory.createForClass(Mail)