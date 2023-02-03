import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard, LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken() {
	  return { status: "OK", message: "token is valid"};
  }

  @Get('oauth')
  loginWithIntra(@Query('code') code: string, @Query('state') state: string) {
    return this.authService.loginWithIntra(code, state);
  }
}
