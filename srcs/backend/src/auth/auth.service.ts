import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FilesService } from 'src/files/files.service';
import { IntraAuthService } from 'src/intra-auth/intra-auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly intraAuthService: IntraAuthService,
    private readonly filesService: FilesService
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
    const intraToken = await this.intraAuthService.getUserIntraToken(code, state);
    const {email, username, userImageURL} = await this.intraAuthService.getUserInfo(intraToken);
    let userId: number;
    
    const foundUser = await this.usersService.findOneByEmail(email);
    if (!foundUser) {
      let createdUser = await this.usersService.createWithoutPassword(email, username);
      userId = createdUser.id;
      await this.updateUserAvatarWithPixelizedIntraImage(userImageURL, username, userId);
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

  private async updateUserAvatarWithPixelizedIntraImage(userImageURL: string, username: string, userId: number) {
    const imagePath = await this.intraAuthService.downloadIntraImage(userImageURL);
    if (!imagePath)
      return;

    const pixelizedImagePath = await this.filesService.pixelizeUserImage(imagePath, username);
    this.filesService.deleteFile(imagePath);
    console.log('pixelized', pixelizedImagePath)
    if (!pixelizedImagePath)
      return;

    const updateUserDto: UpdateUserDto = {
      avatar: this.filesService.getFileNameFromPath(pixelizedImagePath)
    }
    this.usersService.update(userId, updateUserDto);
  }
}
