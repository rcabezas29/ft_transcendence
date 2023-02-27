import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { FriendshipStatus } from '../entities/friendship.entity';

export class CreateFriendshipDto {
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
