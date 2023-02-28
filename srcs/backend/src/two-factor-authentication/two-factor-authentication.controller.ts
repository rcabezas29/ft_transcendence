import { Controller, Post, UseGuards, Req, Res, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { RequestWithUser } from 'src/users/interfaces/request-with-user.interface';
import { TwoFactorAuthenticationCodeDto } from './dto/two-factor-auth-code.dto';
import { UsersService } from 'src/users/users.service';

@Controller('2fa')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly usersService: UsersService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('generate')
    async register(@Res() res: Response, @Req() req: RequestWithUser) {
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpAuthUrl);
    }

    @Post('turn-on')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async turnOnTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            twoFactorAuthenticationCode, request.user
        );
        if (!isCodeValid)
            throw new UnauthorizedException('Wrong authentication code');

        await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
    }
}
