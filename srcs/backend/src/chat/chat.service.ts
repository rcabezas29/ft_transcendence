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

    onNewConnection(client: GatewayUser) {
		const friends: GatewayUser[] = this.gatewayManagerService.getAllClients(); // FIXME: coger solo amigos, no allClients
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
		client.socket.broadcast.emit('friend-online', newClientPayload);
	}

    onDisconnection(client: GatewayUser) {
		const userPayload: Friend = {
			id: client.id,
			username: client.username
		}
		client.socket.broadcast.emit('friend-offline', userPayload);
	}
}
