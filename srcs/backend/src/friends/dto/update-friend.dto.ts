import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';
import { CreateFriendDto } from './create-friend.dto';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  @IsOptional()
  @IsNumber()
  readonly status: FriendshipStatus;
}
