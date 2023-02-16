import { Injectable } from '@nestjs/common';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChatUser, DirectMessagePayload } from './interfaces';

@Injectable()
export class ChatService {

    constructor(
        private gatewayManagerService: GatewayManagerService
    ) { }

	directMessage(fromUser: GatewayUser, receivedPayload: DirectMessagePayload): void {
		const toUser: GatewayUser = this.gatewayManagerService.getClientByUserId(receivedPayload.friendId);
		const payloadToSend: DirectMessagePayload = {
			friendId: fromUser.id,
   			message: receivedPayload.message
		}
		toUser.socket.emit('direct-message', payloadToSend);
	}

	gatewayUserToChatUser(gatewayUser: GatewayUser): ChatUser {
		const chatUser: ChatUser = {
			id: gatewayUser.id, 
			username: gatewayUser.username
		}
		return chatUser;
	}
	
}
