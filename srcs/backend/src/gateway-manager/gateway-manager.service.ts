import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserFriend } from 'src/users/interfaces/user-friend.interface';
import { UsersService } from 'src/users/users.service';
import { GatewayUser } from './interfaces/gateway-user.interface';

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
		const friendsPayload: number[] = friends.map((user) => user.id);
		
		client.socket.emit('connected-friends', friendsPayload);
		friends.forEach(friend => {
			friend.socket.emit('friend-online', client.id);
		})
	}

    async onDisconnection(client: GatewayUser) {
		const friends: GatewayUser[] = await this.getAllUserConnectedFriends(client.id);

		friends.forEach(friend => {
			friend.socket.emit('friend-offline', client.id);
		})
	}
}
