import { Injectable, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async create( createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(@Request() req) {
    const payload: JwtPayload = { id: req.user.id };
    return {
      access_token: this.getJwtToken(payload)
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload);
    return access_token;
  }

}
