import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ref } from "process";

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })

export class Task {

    @Prop({ ref: 'User', type: Types.ObjectId})
    user: Types.ObjectId

    @Prop({ required: true})
    title: string;

    @Prop()
    description?: string;
    
    @Prop({type: Date})
    deadline?: Date;
    
    @Prop({ enum: ['pending', 'completed'], default: 'pending'})
    status?: string;    

    @Prop()
    comment?: string;    

    @Prop({type: Date, default: Date.now })
    reminder: Date

    @Prop({ type: Date, default: Date.now })
    createdAt?: Date

    @Prop()
    reminderSent?: boolean
}
export const TaskSchema = SchemaFactory.createForClass(Task)