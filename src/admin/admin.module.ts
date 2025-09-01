import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), MailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
