import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TwoFactorAuthenticationService {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(user.email, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);

        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);  
        return {
            secret,
            otpAuthUrl
        }
    }

    async pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
        return toFileStream(stream, otpAuthUrl);
    }

    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret
        })
    }
}
