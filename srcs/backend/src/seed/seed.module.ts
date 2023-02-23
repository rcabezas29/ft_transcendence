import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { BlockedFriendshipsModule } from 'src/blocked-friendships/blocked-friendships.module';
import { UserFriendshipsModule } from 'src/user-friendships/user-friendships.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, UserFriendshipsModule, BlockedFriendshipsModule]
})
export class SeedModule {}
