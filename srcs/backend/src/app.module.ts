import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { GatewayManagerModule } from './gateway-manager/gateway-manager.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { Friends } from './friends/entities/friend.entity';
import { IntraAuthModule } from './intra-auth/intra-auth.module';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    IntraAuthModule,
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'postgres',
      entities: [User, Friends],
      synchronize: true,
    }),
	ScheduleModule.forRoot(),
    SeedModule,
    GatewayManagerModule,
    ChatModule,
    FriendsModule,
    GameModule,
  ],
})
export class AppModule {}
