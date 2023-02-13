import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { FriendshipStatus } from "../entities/friend.entity";

export class UpdateFriendDto {
    @IsNumber()
    @Min(0)
    @Max(2)
    @IsOptional()
    status?: FriendshipStatus;
}
