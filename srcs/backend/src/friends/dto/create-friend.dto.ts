import { IsNumber } from 'class-validator';

export class CreateFriendDto {
  @IsNumber()
  user1Id: number;

  @IsNumber()
  user2Id: number;
}
