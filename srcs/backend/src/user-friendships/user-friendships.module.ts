import { Module } from '@nestjs/common';
import { UserFriendshipsService } from './user-friendships.service';
import { UserFriendshipsController } from './user-friendships.controller';
import { BlockedFriendshipsModule } from 'src/blocked-friendships/blocked-friendships.module';
import { UsersModule } from 'src/users/users.module';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  controllers: [UserFriendshipsController],
  providers: [UserFriendshipsService],
  imports: [
    BlockedFriendshipsModule,
    UsersModule,
    FriendshipsModule,
    GatewayManagerModule
  ],
  exports: [UserFriendshipsService],
})
export class UserFriendshipsModule {}
