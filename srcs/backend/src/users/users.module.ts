import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FriendshipsModule } from 'src/friendships/friendships.module';
import { StatsModule } from 'src/stats/stats.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    FriendshipsModule,
    StatsModule,
    FilesModule
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
