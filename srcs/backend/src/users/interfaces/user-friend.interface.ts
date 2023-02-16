import { FriendshipStatus } from "src/friends/entities/friend.entity";

export interface UserFriend {
	userId: number,
	username: string,
	friendshipStatus: FriendshipStatus
}
