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
import { PasswordUtilsService } from 'src/password-utils/password-utils.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly intraAuthService: IntraAuthService,
        private readonly filesService: FilesService,
        private readonly passwordUtilsService: PasswordUtilsService
    ) {}
    
    async createUser(createUserDto: CreateUserDto) {
        const newpass = await this.passwordUtilsService.hashPassword(createUserDto.password);
        createUserDto.password = newpass;
        return this.usersService.create(createUserDto);
    }
    
    async validateUser(email: string, pass: string): Promise<User> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user)
            return null;

        const pass_check = await bcrypt.compare(pass, user.password)
        if (pass_check) {
            return user;
        }
        return null;
    }
    
    async login(requestUser: User) {
        const access_token = this.getJwtToken(requestUser.id);
        return { access_token };
    }
    
    async loginWithIntra(code: string, state: string) {
        const intraToken = await this.intraAuthService.getUserIntraToken(code, state);
        const {email, intraUsername, userImageURL} = await this.intraAuthService.getUserInfo(intraToken);
        let userId: number;
        let isFirstLogin = false;
        
        const foundUser: User = await this.usersService.findOneByEmail(email);
        if (!foundUser) {
            isFirstLogin = true;
            const createdUser = await this.usersService.createWithIntraUser(email, intraUsername);
            userId = createdUser.id;
            await this.updateUserAvatarWithPixelizedIntraImage(userImageURL, intraUsername, userId);
        }
        else
            userId = foundUser.id;

        const jwtToken = this.getJwtToken(userId);
        
        return { access_token: jwtToken, isFirstLogin };
    }

    getJwtToken(userId: number, isSecondFactorAuthenticated: boolean = false) {
        const payload: JwtPayload = { id: userId, isSecondFactorAuthenticated };
        const access_token = this.jwtService.sign(payload);
        return access_token;
    }

    private async updateUserAvatarWithPixelizedIntraImage(userImageURL: string, intraUsername: string, userId: number) {
        const imagePath = await this.intraAuthService.downloadIntraImage(userImageURL);
        if (!imagePath)
            return;
        
        const pixelizedImagePath = await this.filesService.pixelizeUserImage(imagePath, intraUsername);
        this.filesService.deleteFile(imagePath);
        if (!pixelizedImagePath)
            return;
        
        const updateUserDto: UpdateUserDto = {
            avatar: this.filesService.getFileNameFromPath(pixelizedImagePath)
        }
        this.usersService.update(userId, updateUserDto);
    }
}
    