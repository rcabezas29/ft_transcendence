import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { GatewayManagerModule } from './gateway-manager/gateway-manager.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'postgres',
      entities: [User],
      synchronize: true,
    }),
    SeedModule,
    GatewayManagerModule,
	ChatModule
  ]
})
export class AppModule {}
