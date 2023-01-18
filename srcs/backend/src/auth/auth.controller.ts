import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Request() req) {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken() {
	  return { status: "OK", message: "token is valid"};
  }
}
