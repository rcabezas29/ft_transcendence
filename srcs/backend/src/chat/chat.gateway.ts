import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { MessagePayload } from './interfaces/message-payload.interface';
import { Friend } from './interfaces/friend.interface';

@WebSocketGateway({cors: true})
export class ChatGateway {
	constructor(
		private gatewayManagerService: GatewayManagerService,
	) {}
	 
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