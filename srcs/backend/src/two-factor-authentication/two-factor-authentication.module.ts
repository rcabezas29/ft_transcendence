import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [TwoFactorAuthenticationService],
  imports: [UsersModule, AuthModule],
  exports: [TwoFactorAuthenticationService],
  controllers: [TwoFactorAuthenticationController]
})
export class TwoFactorAuthenticationModule {}
