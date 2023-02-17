import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';

export class CreateFriendDto {
  @IsInt()
  user1Id: number;

  @IsInt()
  user2Id: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  status?: FriendshipStatus;
}
