import { forwardRef, Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/friendship.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [FriendshipsController],
  providers: [FriendshipsService],
  imports: [TypeOrmModule.forFeature([Friendship]), forwardRef(() => UsersModule)],
  exports: [FriendshipsService, TypeOrmModule],
})
export class FriendshipsModule {}
