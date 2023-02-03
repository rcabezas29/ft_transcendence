import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, LocalStrategy } from './strategies';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET || 'default_jwt_secret_value',
          signOptions: {expiresIn: '2h'}
        }
      }
    })
  ],
  exports: [JwtModule]
})
export class AuthModule {}
