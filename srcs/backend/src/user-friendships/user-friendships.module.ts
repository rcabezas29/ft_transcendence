import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from 'src/friends/entities/friendship.entity';
import { UserFriendshipsService } from './user-friendships.service';

@Module({
  providers: [UserFriendshipsService],
  imports: [TypeOrmModule.forFeature([Friendship])],
  exports: [UserFriendshipsService, TypeOrmModule]
})
export class UserFriendshipsModule {}
