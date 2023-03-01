import { Controller, Post, UseGuards, Req, Res, HttpCode, Body, Get } from '@nestjs/common';
import { JwtAuthGuard, JwtTwoFactorGuard } from 'src/auth/guards';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { RequestWithUser } from 'src/users/interfaces/request-with-user.interface';
import { TwoFactorAuthenticationCodeDto } from './dto/two-factor-auth-code.dto';

@Controller('2fa')
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    ) {}

    @UseGuards(JwtTwoFactorGuard)
    @Post('generate')
    async generate(@Res() res: Response, @Req() req: RequestWithUser) {
        const { otpAuthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req.user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(res, otpAuthUrl);
    }

    @UseGuards(JwtTwoFactorGuard)
    @Post('turn-on')
    @HttpCode(200)
    async turnOnTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto
    ) {
        await this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(request.user, twoFactorAuthenticationCodeDto);
    }

    @UseGuards(JwtTwoFactorGuard)
    @Post('turn-off')
    @HttpCode(200)
    async turnOffTwoFactorAuthentication(@Req() request: RequestWithUser) {
        await this.twoFactorAuthenticationService.turnOffTwoFactorAuthentication(request.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('authenticate')
    @HttpCode(200)
    async authenticate(
        @Req() request: RequestWithUser,
        @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto
    ) {
        return this.twoFactorAuthenticationService.authenticate(request.user, twoFactorAuthenticationCodeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('is-enabled')
    isEnabled(@Req() request: RequestWithUser) {
        return this.twoFactorAuthenticationService.isEnabled(request.user);
    }
}
