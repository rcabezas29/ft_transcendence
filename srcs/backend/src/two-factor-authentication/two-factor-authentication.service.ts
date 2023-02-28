import { Injectable, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthenticationCodeDto } from './dto/two-factor-auth-code.dto';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(
            user.email,
            process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
            secret
        );

        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);  
        return {
            secret,
            otpAuthUrl
        }
    }

    async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
        return toFileStream(stream, otpAuthUrl);
    }

    async turnOnTwoFactorAuthentication(requestUser: User, { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto) {
        const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationCode, requestUser
        );
        if (!isCodeValid)
            throw new UnauthorizedException('Wrong authentication code')

        return this.usersService.turnOnTwoFactorAuthentication(requestUser.id);
    }

    async turnOffTwoFactorAuthentication(requestUser: User) {
        await this.usersService.setTwoFactorAuthenticationSecret('', requestUser.id);  
        return this.usersService.turnOffTwoFactorAuthentication(requestUser.id);
    }

    async authenticate(requestUser: User, { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto) {
        const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationCode, requestUser
        );
        if (!isCodeValid)
            throw new UnauthorizedException('Wrong authentication code');

        const accessToken = this.authService.getJwtToken(requestUser.id, true);
        return { access_token: accessToken };
    }

    private isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret
        })
    }
}
