import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";

type UserId = number;

type AmountOfSeconds = number;

type DateSanctionLifts = Date;
type UserIdSanctionMap = {
    [id: UserId]: DateSanctionLifts; 
}

export default class Channel {
	private _name: string;
	private _users: GatewayUser[] = [];
	private _owner: GatewayUser;
	private _admins: GatewayUser[] = [];
	private _bannedUsers: UserIdSanctionMap = {};
	private _mutedUsers: UserIdSanctionMap = {};
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

	banUser(user: GatewayUser, banTime: AmountOfSeconds): void {
		const nowTime = new Date().getTime();
		const endTime = nowTime + (banTime * 1000);
		this._bannedUsers[user.id] = new Date(endTime);
	}

	unbanUser(user: GatewayUser): void {
		delete(this._bannedUsers[user.id]);
	}

	muteUser(user: GatewayUser, muteTime: AmountOfSeconds): void {
		const nowTime = new Date().getTime();
		const endTime = nowTime + (muteTime * 1000);
		this._mutedUsers[user.id] = new Date(endTime);
	}

	unmuteUser(user: GatewayUser): void {
		delete(this._mutedUsers[user.id]);
	}

	hasUser(user: GatewayUser): boolean {
		if (this._users.find((channelUser) => channelUser == user))
			return true;
		return false;
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

	userIsAdmin(user: GatewayUser): boolean {
		if (this._admins.find((u) => u == user))
			return true;
		return false;
	}

	checkRemainingUserBanTime(user: GatewayUser): number {
		if (user.id in this._bannedUsers)
		{
			const endTime = this._bannedUsers[user.id].getTime();
			const nowTime = new Date().getTime();
			const remaining = endTime - nowTime;
			if (remaining <= 0)
			{
				this.unbanUser(user);
				return 0;
			}
			return Math.ceil(remaining / 1000);
		}
		return 0;
	}

	checkRemainingUserMuteTime(user: GatewayUser): number {
		if (user.id in this._mutedUsers)
		{
			const endTime = this._mutedUsers[user.id].getTime();
			const nowTime = new Date().getTime();
			const remaining = endTime - nowTime;
			if (remaining <= 0)
			{
				this.unmuteUser(user);
				return 0;
			}
			return Math.ceil(remaining / 1000);
		}
		return 0;
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

	get bannedUsers(): UserIdSanctionMap {
		return this._bannedUsers;
	}

	get mutedUsers(): UserIdSanctionMap {
		return this._mutedUsers;
	}

	get password(): string {
		return this._password;
	}
}