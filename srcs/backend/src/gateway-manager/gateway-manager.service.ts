import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserFriend } from 'src/users/interfaces/user-friend.interface';
import { UserRole } from 'src/users/interfaces/user-roles';
import { UsersService } from 'src/users/users.service';
import { ConnectedFriendsPayload, GatewayUser } from './interfaces';

@Injectable()
export class GatewayManagerService {

	private users: GatewayUser[] = [];
	private onNewConnectionCallbacks: Function[] = [];
	private onDisconnectionCallbacks: Function[] = [];

	constructor(
        @Inject(UsersService)
		private usersService: UsersService,
	) {
		this.addOnNewConnectionCallback((client: GatewayUser) => this.onNewConnection(client));
        this.addOnDisconnectionCallback((client: GatewayUser) => this.onDisconnection(client));
	}

	getClientByUserId(id: number): GatewayUser {
		return this.users.find((user) => user.id == id);
	}

	getClientBySocketId(id: string): GatewayUser {
		return this.users.find((user) => user.socket.id == id);
	}

	getAllClients(): GatewayUser[] {
		return this.users;
	}

	async getAllUserConnectedFriends(id: number): Promise<GatewayUser[]> {
		const friends: UserFriend[] = await this.usersService.getAllUserFriends(id);
		const friendsIds: number[] = friends.map((friend) => friend.userId);
		const userFriends: GatewayUser[] = this.users.filter((user) => {
			const friendId: number = friendsIds.find((id) => id == user.id);
			if (friendId)
				return user;
		})

		return userFriends;
	}

	addClient(user: GatewayUser): void {
		this.users.push(user);
	}

	removeClient(socketId: string): void {
		this.users = this.users.filter((u) => u.socket.id != socketId);
	}

	addOnNewConnectionCallback(callback: Function): void {
		this.onNewConnectionCallbacks.push(callback);
	}

	addOnDisconnectionCallback(callback: Function): void {
		this.onDisconnectionCallbacks.push(callback);
	}

	getOnNewConnectionCallbacks(): Function[] {
		return this.onNewConnectionCallbacks;
	}

	getOnDisconnectionCallbacks(): Function[] {
		return this.onDisconnectionCallbacks;
	}

	async onNewConnection(client: GatewayUser) {
		const friends: GatewayUser[] = await this.getAllUserConnectedFriends(client.id);
		const friendsPayload: ConnectedFriendsPayload[] = friends.map((user) => {
			return { id: user.id, isGaming: user.isGaming}
		});
		
		client.socket.emit('connected-friends', friendsPayload);

		if (client.isGaming == false) {
			friends.forEach(friend => {
				friend.socket.emit('friend-online', client.id);
			})
		} else {
			friends.forEach(friend => {
				friend.socket.emit('friend-in-a-game', client.id);
			})
		}
	}

    async onDisconnection(client: GatewayUser) {
		const friends: GatewayUser[] = await this.getAllUserConnectedFriends(client.id);

		friends.forEach(friend => {
			friend.socket.emit('friend-offline', client.id);
		})
	}

	async onUserUpdated(client: GatewayUser) {
		const user: User = await this.usersService.findOneById(client.id);
		const { id, username } = user;

		client.username = username;

		client.socket.broadcast.emit("user-updated", { id, username });
	}

	onUserRoleUpdated(userId: number, newRole: UserRole) {
		const adminGatewayUser = this.getClientByUserId(userId);
		if (!adminGatewayUser)
			return;

		adminGatewayUser.role = newRole;

		if (newRole == UserRole.ADMIN)
			adminGatewayUser.socket.emit("website-admin");
		else if (newRole == UserRole.USER)
			adminGatewayUser.socket.emit("remove-website-admin");
	}

	setGatewayUserGamingStatus(id: number) {
		const user: GatewayUser = this.users.find((u) => u.id == id);
		if (user)
			user.isGaming = true;
	}

	unsetGatewayUserGamingStatus(id: number) {
		const user: GatewayUser = this.users.find((u) => u.id == id);
		if (user)
			user.isGaming = false;
	}

	clientIsWebsiteAdmin(client: GatewayUser) {
		return (client.role == UserRole.ADMIN || client.role == UserRole.OWNER)
	}

	getAllWebsiteAdminClients(): GatewayUser[] {
		return this.users.filter((user) => this.clientIsWebsiteAdmin(user));
	}

}
