import { Module } from '@nestjs/common';
import { BlockedFriendshipsService } from './blocked-friendships.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedFriendship } from './entities/blocked-friendship.entity';

@Module({
  providers: [BlockedFriendshipsService],
  imports: [
    TypeOrmModule.forFeature([BlockedFriendship]),
  ],
  exports: [BlockedFriendshipsService]
})
export class BlockedFriendshipsModule {}
