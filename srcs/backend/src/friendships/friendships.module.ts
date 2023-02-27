import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from 'src/friendships/entities/friendship.entity';
import { FriendshipsService } from './friendships.service';

@Module({
  providers: [FriendshipsService],
  imports: [TypeOrmModule.forFeature([Friendship])],
  exports: [FriendshipsService, TypeOrmModule]
})
export class FriendshipsModule {}
