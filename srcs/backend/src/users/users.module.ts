import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FriendshipsModule } from 'src/friends/friendships.module';
import { IntraAuthModule } from 'src/intra-auth/intra-auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), FriendshipsModule, IntraAuthModule],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
