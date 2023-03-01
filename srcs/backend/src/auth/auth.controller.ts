import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { RequestWithUser } from 'src/users/interfaces/request-with-user.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard, LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto, @Req() req: RequestWithUser) {
    console.log("REQ USER", req.user)
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
