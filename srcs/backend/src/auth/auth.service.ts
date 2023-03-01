import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FilesService } from 'src/files/files.service';
import { IntraAuthService } from 'src/intra-auth/intra-auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly intraAuthService: IntraAuthService,
        private readonly filesService: FilesService
    ) {}
    
    async createUser(createUserDto: CreateUserDto) {
        const newpass = await this.hashPassword(createUserDto.password);
        createUserDto.password = newpass;
        return this.usersService.create(createUserDto);
    }
    
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user)
            return null;

        const pass_check = await bcrypt.compare(pass, user.password)
        if (pass_check) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    
    async login(requestUser) {
        const access_token = this.getJwtToken(requestUser.id);
        return { access_token };
    }
    
    async loginWithIntra(code: string, state: string) {
        const intraToken = await this.intraAuthService.getUserIntraToken(code, state);
        const {email, username, userImageURL} = await this.intraAuthService.getUserInfo(intraToken);
        let userId: number;
        
        const foundUser: User = await this.usersService.findOneByEmail(email);
        if (!foundUser) {
            let createdUser = await this.usersService.createWithoutPassword(email, username);
            userId = createdUser.id;
            await this.updateUserAvatarWithPixelizedIntraImage(userImageURL, username, userId);
        }
        else
            userId = foundUser.id;

        const jwtToken = this.getJwtToken(userId);
        
        return { access_token: jwtToken };
    }

    getJwtToken(userId: number, isSecondFactorAuthenticated: boolean = false) {
        const payload: JwtPayload = { id: userId, isSecondFactorAuthenticated };
        const access_token = this.jwtService.sign(payload);
        return access_token;
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    
    private async updateUserAvatarWithPixelizedIntraImage(userImageURL: string, username: string, userId: number) {
        const imagePath = await this.intraAuthService.downloadIntraImage(userImageURL);
        if (!imagePath)
            return;
        
        const pixelizedImagePath = await this.filesService.pixelizeUserImage(imagePath, username);
        this.filesService.deleteFile(imagePath);
        if (!pixelizedImagePath)
            return;
        
        const updateUserDto: UpdateUserDto = {
            avatar: this.filesService.getFileNameFromPath(pixelizedImagePath)
        }
        this.usersService.update(userId, updateUserDto);
    }
}
    