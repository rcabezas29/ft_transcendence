import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MessagePayload } from './interfaces/message-payload.interface';
import { Friend } from './interfaces/friend.interface';

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private gatewayManagerService: GatewayManagerService,
	) {}

	handleConnection(client: Socket, ...args: any[]) {
		const friends: GatewayUser[] = this.gatewayManagerService.getAllClients(); // FIXME: coger solo amigos, no allClients
		const friendsPayload: Friend[] = friends.map((user) => {
			const friend: Friend = {
				id: user.id,
				username: "usernameToBeFixed!"
			}
			return friend;
		});

		const clientInfo: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const newClientPayload: Friend = {
			id: clientInfo.id,
			username: "myUsername"
		}

		client.emit('connected-friends', friendsPayload);
		client.broadcast.emit('friend-online', newClientPayload);
	}

	handleDisconnect(client: Socket) {
		const clientInfo: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const userPayload: Friend = {
			id: clientInfo.id,
			username: "myUsername"
		}
		client.broadcast.emit('friend-offline', userPayload);
		this.gatewayManagerService.removeClient(client.id);

	}
	 
	@SubscribeMessage("direct-message")
	directMessage(client: Socket, receivedPayload: MessagePayload) {
		const fromUser: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const toUser: GatewayUser = this.gatewayManagerService.getClientByUserId(receivedPayload.friendId);
		const payloadToSend: MessagePayload = {
			friendId: fromUser.id,
   			message: receivedPayload.message
		}
		toUser.socket.emit('direct-message', payloadToSend);
	}

}