export interface UserData {
    id: number;
    username: string;
	intraUsername: string;
    email: string;
    avatar: string;
    elo: number;
    isTwoFactorAuthenticationEnabled: boolean;
    stats: Object;
}
