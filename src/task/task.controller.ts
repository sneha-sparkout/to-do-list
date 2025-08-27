import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/create-task')
  @UseGuards(JwtAuthGuard)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    const userId = req.user._id;
    return this.taskService.createTask(createTaskDto, userId);
  }

  @Get('/today-task')
  @UseGuards(JwtAuthGuard)
  viewTodayTask(@Req() req){
   const userId = req.user._id
    return this.taskService.viewTask(userId)
  }

  @Get('/past-task')
  @UseGuards(JwtAuthGuard)
  pastTask(@Req() req){
    const userId = req.user._id
    return this.taskService.viewPastTask(userId)
  }

  @Put('/update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.editTask(updateTaskDto, id);
  }
  
  @Put('/update-comment/:id')
  @UseGuards(JwtAuthGuard)
  updateComment(@Param('id') id: string, @Body() body: {comment: string}) {
    return this.taskService.addComment(id, body.comment);
  }
  
  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.taskService.removeTask(id);
  }

}
