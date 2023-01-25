import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { GatewayUser } from './interfaces/gateway-user.interface';

@Injectable()
export class GatewayManagerService {

	private users: GatewayUser[] = [];
	private onNewConnectionCallbacks: Function[] = [];
	private onDisconnectionCallbacks: Function[] = [];

	constructor(
		private usersService: UsersService
	) { }

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
		const friends: User[] = await this.usersService.findUserActiveFriends(id);
		const friendsIds: number[] = friends.map((friend) => friend.id);
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

	getOnDisconnectionCallback(): Function[] {
		return this.onDisconnectionCallbacks;
	}

}
