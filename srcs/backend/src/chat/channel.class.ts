import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";

type UserId = number;
type AmountOfSeconds = number;
type UserIdSanctionTimeMap = {
    [id: UserId]: AmountOfSeconds; 
}

export default class Channel {
	private _name: string;
	private _users: GatewayUser[] = [];
	private _owner: GatewayUser;
	private _admins: GatewayUser[] = [];
	private _bannedUsers: UserIdSanctionTimeMap[] = [];
	private _mutedUsers: UserIdSanctionTimeMap[] = [];
	private _password: string = null;

	constructor(name: string, owner: GatewayUser) {
		this._name = name;
		this._owner = owner;
		this._admins.push(owner);
		this._users.push(owner);
	}

	setAdmin(admin: GatewayUser): void {
		this._admins.push(admin);
	}

	unsetAdmin(admin: GatewayUser): void {
		this._admins = this._admins.filter((user) => user != admin);
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
		return this._users.find((channelUser) => channelUser == user);
	}

	addUser(user: GatewayUser): void {
		this._users.push(user);
	}

	removeUser(user: GatewayUser): void {
		if (this._owner === user && this._users.length > 1)
		{
			this._owner = this._users[1];
			if (!this._admins.find((admin) => admin === this._owner))
				this._admins.push(this._owner);
		}
		this._users = this._users.filter((u) => u != user);
		this.unsetAdmin(user);
	}

	get name(): string {
		return this._name;
	}

	get users(): GatewayUser[] {
		return this._users;
	}

	get owner(): GatewayUser {
		return this._owner;
	}

	get admins(): GatewayUser[] {
		return this._admins;
	}

	get bannedUsers(): UserIdSanctionTimeMap[] {
		return this._bannedUsers;
	}

	get mutedUsers(): UserIdSanctionTimeMap[] {
		return this._mutedUsers;
	}

	get password(): string {
		return this._password;
	}
}