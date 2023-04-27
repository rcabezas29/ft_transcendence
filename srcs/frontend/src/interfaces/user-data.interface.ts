export interface UserStats {
	wonGames: number;
	lostGames: number;
    drawGames: number;
    scoredGoals: number;
    receivedGoals: number;
}

export enum UserRole {
	USER = "user",
	ADMIN = "admin",
	OWNER = "owner"
}

export interface UserData {
    id: number;
    username: string;
	intraUsername: string;
    email: string;
    avatar: string;
	avatarURL?: string;
    elo: number;
    isTwoFactorAuthenticationEnabled: boolean;
    stats: UserStats;
	role: UserRole;
    isBanned: boolean;
}

export enum FriendshipStatus {
	Pending = 0,
	Active = 1,
	Blocked = 2,
}

export interface UserFriend {
	userId: number,
	username: string,
    friendshipId: number;
	friendshipStatus: FriendshipStatus;
	avatarURL: string;
	elo: number;
	wonGames: number;
	lostGames: number;
}
