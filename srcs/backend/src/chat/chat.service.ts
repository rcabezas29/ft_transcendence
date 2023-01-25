import { Injectable } from '@nestjs/common';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { Friend } from './interfaces/friend.interface';

@Injectable()
export class ChatService {
    constructor(
        private gatewayManagerService: GatewayManagerService
    ) {
        this.gatewayManagerService.addOnNewConnectionCallback((client: GatewayUser) => this.onNewConnection(client));
        this.gatewayManagerService.addOnDisconnectionCallback((client: GatewayUser) => this.onDisconnection(client));
    }

    async onNewConnection(client: GatewayUser) {
		const friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(client.id);
		const friendsPayload: Friend[] = friends.map((user) => {
			const friend: Friend = {
				id: user.id,
				username: user.username
			}
			return friend;
		});

		const newClientPayload: Friend = {
			id: client.id,
			username: client.username
		}

		client.socket.emit('connected-friends', friendsPayload);
		friends.forEach(friend => {
			friend.socket.emit('friend-online', newClientPayload);
		})
	}

    async onDisconnection(client: GatewayUser) {
		const friends: GatewayUser[] = await this.gatewayManagerService.getAllUserConnectedFriends(client.id);
		const userPayload: Friend = {
			id: client.id,
			username: client.username
		}
		friends.forEach(friend => {
			friend.socket.emit('friend-offline', userPayload);
		})
	}
}
