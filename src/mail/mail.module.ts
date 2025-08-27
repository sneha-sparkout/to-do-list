import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Mail, MailSchema } from './schema/mail.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Task, TaskSchema } from 'src/task/schema/task.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Mail.name, schema: MailSchema},
    {name: User.name, schema: UserSchema},
    {name: Task.name, schema: TaskSchema}
  ])],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
