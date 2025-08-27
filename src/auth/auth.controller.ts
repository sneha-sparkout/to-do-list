import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  create(@Body() createDto: CreateUserDto) {
    return this.authService.signUp(createDto);
  }

  @Post('/login')
  login(@Body() body: {email: string, password: string}) {
    return this.authService.login(body.email, body.password)
  }

}
