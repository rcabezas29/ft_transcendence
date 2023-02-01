import { Injectable } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto) {
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

  async login(requestUser) {
    const payload: JwtPayload = { id: requestUser.id };
    return {
      access_token: this.getJwtToken(payload)
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload);
    return access_token;
  }

  loginWithIntra() {
    console.log('redirecting to api.intra.42.fr/oauth/authorize...')
    return {
      url: 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7d0fc8017a077516cab222b32f73b2e5cdcfe98ef91fb32da63ea4944f4a0900&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Foauth_callback&response_type=code',
      statusCode: 302
    }
  }

}
