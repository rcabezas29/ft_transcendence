import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { FriendshipsModule } from 'src/friends/friendships.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, FriendshipsModule]
})
export class SeedModule {}
