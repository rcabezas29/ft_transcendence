import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, JwtTwoFactorStrategy, LocalStrategy } from './strategies';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { IntraAuthModule } from 'src/intra-auth/intra-auth.module';
import { FilesModule } from 'src/files/files.module';
import { PasswordUtilsModule } from 'src/password-utils/password-utils.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtTwoFactorStrategy],
  imports: [
    IntraAuthModule,
    FilesModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET || 'default_jwt_secret_value',
          signOptions: {expiresIn: '2h'}
        }
      }
    }),
    PasswordUtilsModule
  ],
  exports: [JwtModule, AuthService]
})
export class AuthModule {}
