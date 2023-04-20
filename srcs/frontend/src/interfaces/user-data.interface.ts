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
	role: UserRole
}
