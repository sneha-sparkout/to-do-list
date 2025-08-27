import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/task.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema },
    { name: User.name, schema: UserSchema}
  ])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [MongooseModule]
})
export class TaskModule {}
