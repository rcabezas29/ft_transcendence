import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IntraAuthModule } from 'src/intra-auth/intra-auth.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';
import { StatsModule } from 'src/stats/stats.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    IntraAuthModule,
    FriendshipsModule,
    StatsModule
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
