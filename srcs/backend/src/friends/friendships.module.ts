import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { BlockedFriendshipsModule } from 'src/blocked-friendships/blocked-friendships.module';
import { UsersModule } from 'src/users/users.module';
import { UserFriendshipsModule } from 'src/user-friendships/user-friendships.module';
import { GatewayManagerModule } from 'src/gateway-manager/gateway-manager.module';

@Module({
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  imports: [
    BlockedFriendshipsModule,
    UsersModule,
    UserFriendshipsModule,
    GatewayManagerModule
  ],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
