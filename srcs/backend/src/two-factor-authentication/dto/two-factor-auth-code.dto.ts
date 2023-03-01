import { IsString, Length } from 'class-validator';

export class TwoFactorAuthenticationCodeDto {
    @IsString()
    @Length(6)
    twoFactorAuthenticationCode: string;
}
