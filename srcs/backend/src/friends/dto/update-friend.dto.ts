import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';
import { CreateFriendDto } from './create-friend.dto';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @IsOptional()
  readonly status: FriendshipStatus;
}
