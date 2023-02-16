import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';

export class CreateFriendDto {
  @Type( () => Number)
  @IsInt()
  user1Id: number;

  @IsNumber()
  @Type( () => Number)
  user2Id: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  status?: FriendshipStatus;
}
