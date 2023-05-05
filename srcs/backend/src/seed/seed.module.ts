import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { BlockedFriendshipsModule } from 'src/blocked-friendships/blocked-friendships.module';
import { FriendshipsModule } from 'src/friendships/friendships.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, FriendshipsModule, BlockedFriendshipsModule],
  exports: [SeedService]
})
export class SeedModule {}
