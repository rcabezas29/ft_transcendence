import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async loginWithIntra(code: string, state: string) {
    if (state != process.env.STATE_STRING)
      throw new UnauthorizedException('state strings do not match');

    const intraToken = await this.getIntraToken(code);
    
    const httpResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {"Authorization": `Bearer ${intraToken}`}
    });
    const response = await httpResponse.json();
    if (httpResponse.status != 200)
		  throw new UnauthorizedException(response);

    const userEmail = response.email;
    const username = response.login;
    let userId: number;
    
    const foundUser = await this.usersService.findOneByEmail(userEmail);
    if (!foundUser) {
      let createdUser = await this.usersService.createWithoutPassword(userEmail, username);
      userId = createdUser.id;
    }
    else
      userId = foundUser.id;
    const jwtPayload: JwtPayload = { id: userId };
    const jwtToken = this.getJwtToken(jwtPayload);
    return { access_token: jwtToken };
  }

  private getJwtToken(payload: JwtPayload) {
    const access_token = this.jwtService.sign(payload);
    return access_token;
  }

  private async getIntraToken(code: string) {
    const postBody = {
      grant_type: 'authorization_code',
      client_id: process.env.INTRA_API_UID,
      client_secret: process.env.INTRA_API_SECRET,
      code: code,
      redirect_uri: 'http://localhost:5173/oauth',
      state: process.env.STATE_STRING
    };

    const httpResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: "POST",
      body: JSON.stringify(postBody),
      headers: {"content-type": "application/json"}
    });
    const response = await httpResponse.json();

    if (httpResponse.status != 200)
		  throw new UnauthorizedException(response);

    const token = response.access_token;
    return token;
  }
}
