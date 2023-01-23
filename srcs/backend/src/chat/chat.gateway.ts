import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MessagePayload } from './interfaces/message-payload.interface';
import { Friend } from './interfaces/friend.interface';

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection {

	@WebSocketServer()
	server: Socket;

	constructor(
		private gatewayManagerService: GatewayManagerService,
	) { }

	handleConnection(client: Socket, ...args: any[]) {
		const users: GatewayUser[] = this.gatewayManagerService.getAllClients();
		const usersPayload: Friend[] = users.map((user) => {
			const friend: Friend = {
				id: user.id,
				username: "usernameToBeFixed!"
			}
			return friend;
		});
		this.server.emit('fetch-users', usersPayload);
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