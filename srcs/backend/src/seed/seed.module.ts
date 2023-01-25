import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, FriendsModule]
})
export class SeedModule {}
