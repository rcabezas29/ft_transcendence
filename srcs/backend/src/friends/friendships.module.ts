import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/friendship.entity';

@Module({
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  imports: [TypeOrmModule.forFeature([Friendship])],
  exports: [FriendshipsService, TypeOrmModule],
})
export class FriendshipsModule {}
