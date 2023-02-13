import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';

export class CreateFriendDto {
  @IsNumber()
  user1Id: number;

  @IsNumber()
  user2Id: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  status?: FriendshipStatus;
}
