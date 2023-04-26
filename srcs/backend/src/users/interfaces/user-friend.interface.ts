import { FriendshipStatus } from "src/friendships/entities/friendship.entity";

export interface UserFriend {
	userId: number,
	username: string,
    friendshipId: number;
	friendshipStatus: FriendshipStatus;
	avatarURL?: string;
	elo?: number;
	wonGames?: number;
	lostGames?: number;
}
