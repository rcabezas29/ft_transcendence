import { Injectable } from '@nestjs/common';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChatUser } from './interfaces';

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
		const friendsPayload: ChatUser[] = friends.map((user) => this.gatewayUserToChatUser(user));

		const newClientPayload: ChatUser = {
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
		const userPayload: ChatUser = {
			id: client.id,
			username: client.username
		}
		friends.forEach(friend => {
			friend.socket.emit('friend-offline', userPayload);
		})
	}

	gatewayUserToChatUser(gatewayUser: GatewayUser): ChatUser {
		const chatUser: ChatUser = {
			id: gatewayUser.id, 
			username: gatewayUser.username
		}
		return chatUser;
	}
}
