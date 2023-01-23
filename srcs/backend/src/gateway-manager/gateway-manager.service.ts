import { Injectable } from '@nestjs/common';
import { GatewayUser } from './interfaces/gateway-user.interface';

@Injectable()
export class GatewayManagerService {

	private users: GatewayUser[] = [];
	private onNewConnectionCallbacks: Function[] = [];
	private onDisconnectionCallbacks: Function[] = [];

	getClientByUserId(id: number): GatewayUser {
		return this.users.find((user) => user.id == id);
	}

	getClientBySocketId(id: string): GatewayUser {
		return this.users.find((user) => user.socket.id == id);
	}

	getAllClients(): GatewayUser[] {
		return this.users;
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
