import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friends } from './entities/friend.entity';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [TypeOrmModule.forFeature([Friends])],
  exports: [FriendsService, TypeOrmModule],
})
export class FriendsModule {}
