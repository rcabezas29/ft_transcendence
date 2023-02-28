import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { RequestWithUser } from 'src/users/interfaces/request-with-user.interface';

@Controller('2fa')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async register(@Res() res: Response, @Req() req: RequestWithUser) {
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpAuthUrl);
    }
}
