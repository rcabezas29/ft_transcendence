import { IsInt } from 'class-validator';

export class CreateBlockedFriendshipDto {
  @IsInt()
  userId: number;

  @IsInt()
  blockedUserId: number;

  @IsInt()
  friendshipId: number;
}
  