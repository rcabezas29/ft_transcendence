import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import { Message } from "./interfaces";

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
	private _messages: Message[] = [];

	constructor(name: string, owner: GatewayUser) {
		this._name = name;
		this._owner = owner;
		this._admins.push(owner);
		this._users.push(owner);
	}

	setOwner(owner: GatewayUser): void {
		if (!this.hasUser(owner))
			return;
		this._owner = owner;
		this.setAdmin(owner);
	}

	setAdmin(admin: GatewayUser): void {
		if (this.hasUser(admin) && !this.userIsAdmin(admin))
			this._admins.push(admin);
	}

	unsetAdmin(admin: GatewayUser): void {
		if (this.userIsAdmin(admin))
			this._admins = this._admins.filter((user) => user != admin);
	}

	setPassword(password: string): void {
		this._password = password;
	}

	unsetPassword(): void {
		this._password = null;
	}

	banUser(user: GatewayUser, banTime: AmountOfSeconds): void {
		if (!this.hasUser(user))
			return;
		const nowTime = new Date().getTime();
		const endTime = nowTime + (banTime * 1000);
		this._bannedUsers[user.id] = new Date(endTime);
	}

	unbanUser(user: GatewayUser): void {
		delete(this._bannedUsers[user.id]);
	}

	muteUser(user: GatewayUser, muteTime: AmountOfSeconds): void {
		if (!this.hasUser(user))
			return;
		const nowTime = new Date().getTime();
		const endTime = nowTime + (muteTime * 1000);
		this._mutedUsers[user.id] = new Date(endTime);
	}

	unmuteUser(user: GatewayUser): void {
		delete(this._mutedUsers[user.id]);
	}

	addUser(user: GatewayUser): void {
		this._users.push(user);
	}

	removeUser(user: GatewayUser): void {
		this._users = this._users.filter((u) => u != user);

		if (this._owner === user && this._users.length >= 1)
			this.setOwner(this._users[0]);

		this.unsetAdmin(user);
	}

	hasUser(user: GatewayUser): boolean {
		if (this._users.find((channelUser) => channelUser == user))
			return true;
		return false;
	}

	replaceUser(replacedUser: GatewayUser, replacementUser: GatewayUser): void {
		if (!this.hasUser(replacedUser))
			return;

		this._users = this._users.filter((u) => u != replacedUser);
		this.addUser(replacementUser);

		if (this._owner == replacedUser) {
			this.setOwner(replacementUser);
		}

		if (this.userIsAdmin(replacedUser)) {
			this.unsetAdmin(replacedUser);
			this.setAdmin(replacementUser);
		}
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

	addMessage(message: Message): void {
		this._messages.push(message);
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

	get messages(): Message[] {
		return this._messages;
	}
}