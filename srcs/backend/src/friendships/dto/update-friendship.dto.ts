import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { FriendshipStatus } from "../entities/friendship.entity";

export class UpdateFriendshipDto {
    @IsNumber()
    @Min(0)
    @Max(2)
    @IsOptional()
    status?: FriendshipStatus;
}
