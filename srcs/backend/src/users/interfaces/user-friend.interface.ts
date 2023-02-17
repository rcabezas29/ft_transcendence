import { FriendshipStatus } from "src/friends/entities/friendship.entity";

export interface UserFriend {
	userId: number,
	username: string,
    friendshipId: number;
	friendshipStatus: FriendshipStatus
}
