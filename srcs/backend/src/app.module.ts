import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { GatewayManagerModule } from './gateway-manager/gateway-manager.module';
import { ChatModule } from './chat/chat.module';
import { UserFriendshipsModule } from './user-friendships/user-friendships.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { Friendship } from './friendships/entities/friendship.entity';
import { IntraAuthModule } from './intra-auth/intra-auth.module';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FilesModule } from './files/files.module';
import { BlockedFriendship } from './blocked-friendships/entities/blocked-friendship.entity';
import { BlockedFriendshipsModule } from './blocked-friendships/blocked-friendships.module';
import { StatsModule } from './stats/stats.module';
import { Stats } from './stats/entities/stats.entity';
import { MatchHistoryModule } from './match-history/match-history.module';
import { MatchHistory } from './match-history/entity/match-history.entity';
import { TwoFactorAuthenticationModule } from './two-factor-authentication/two-factor-authentication.module';


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
      entities: [User, Friendship, BlockedFriendship, Stats, MatchHistory],
      synchronize: true,
    }),
	  ScheduleModule.forRoot(),
    SeedModule,
    GatewayManagerModule,
    ChatModule,
    FriendshipsModule,
    GameModule,
    FilesModule,
    BlockedFriendshipsModule,
    UserFriendshipsModule,
    StatsModule,
    MatchHistoryModule,
    TwoFactorAuthenticationModule,
  ],
})
export class AppModule {}
