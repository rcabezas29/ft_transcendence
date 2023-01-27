import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";

type UserId = number;
type AmountOfSeconds = number;
type UserIdSanctionTimeMap = {
    [id: UserId]: AmountOfSeconds; 
}

export default class Channel {

	public name: string;
	private users: GatewayUser[] = [];
	private owner: GatewayUser;
	private admins: GatewayUser[] = [];
	private bannedUsers: UserIdSanctionTimeMap[] = [];
	private mutedUsers: UserIdSanctionTimeMap[] = [];
	private password: string = null;

	constructor(name: string, owner: GatewayUser) {
		this.name = name;
		this.owner = owner;
		this.users.push(owner);
	}

	setAdmin(): void {

	}

	unsetAdmin(): void {
		
	}

	setPassword(): void {

	}

	unsetPassword(): void {

	}

	banUser(): void {

	}

	unbanUser(): void {

	}

	muteUser(): void {

	}

	unmuteUser(): void {

	}

	hasUser(user: GatewayUser): GatewayUser | null {
		return this.users.find((channelUser) => channelUser == user);
	}

}