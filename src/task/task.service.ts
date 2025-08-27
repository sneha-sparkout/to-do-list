import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schema/task.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class TaskService {
    constructor (@InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}
  async createTask (createDto: CreateTaskDto, userId: string): Promise<TaskDocument>{
        const user = await this.userModel.findById(userId)
        if(!user) throw new UnauthorizedException(' you must login or sign up to create a task')
        const newTask = new this.taskModel({
        ...createDto,
        user: userId
    })
    return newTask.save()
  }
  async editTask(updateDto: UpdateTaskDto, taskId: string){
    const updateTask = await this.taskModel.findByIdAndUpdate(taskId, updateDto, { new: true })
    if(!updateTask) throw new NotFoundException('Task not found')
    return updateTask;
  }
  async addComment(taskId: string, comment: string): Promise<TaskDocument>{
    const updateCommentTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      {comment},
      {new: true}
    )
    if (!updateCommentTask) throw new NotFoundException('task not found')
      return updateCommentTask;
  }
  async removeTask(taskId: string){
    const deleteTask = await this.taskModel.findByIdAndDelete(taskId).exec()
    if(!deleteTask) throw new NotFoundException('task not found')
      return { message: "task deleted successfully"}
  }
  async viewTask(userId: string): Promise<TaskDocument[]>{
    const now = new Date();
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date();
  endDay.setHours(23, 59, 59, 999);

    return await this.taskModel.find({
      user: userId,
      deadline: { $gte: startDay, $lte: endDay}
    }).exec()
  }
  async viewPastTask(userId: string): Promise<TaskDocument[]>{
    const now = new Date;
    const startOfDate = new Date(now.setHours(0,0,0,0))
    return await this.taskModel.find({
      user: userId,
      deadline: { $lte: startOfDate }
    }).exec()
  }
}
