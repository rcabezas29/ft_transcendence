import { Injectable } from '@nestjs/common';
import { FriendshipsService } from 'src/friendships/friendships.service';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChatUser, DirectMessagePayload } from './interfaces';

@Injectable()
export class ChatService {

    constructor(
        private gatewayManagerService: GatewayManagerService,
		private friendshipsService: FriendshipsService
    ) { }

	async directMessage(fromUser: GatewayUser, receivedPayload: DirectMessagePayload): Promise<void> {
		const toUser: GatewayUser = this.gatewayManagerService.getClientByUserId(receivedPayload.friendId);

		if (!toUser)
			return ;

		const usersAreFriends = await this.friendshipsService.usersAreFriends(fromUser.id, toUser.id);
		if (!usersAreFriends)
			return ;

		const payloadToSend: DirectMessagePayload = {
			friendId: fromUser.id,
   			message: receivedPayload.message
		}
		toUser.socket.emit('direct-message', payloadToSend);
	}

	async challenge(fromUser: GatewayUser, receivedPayload: DirectMessagePayload): Promise<void> {
		const toUser: GatewayUser = this.gatewayManagerService.getClientByUserId(receivedPayload.friendId);

		if (!toUser)
			return ;

		const usersAreFriends = await this.friendshipsService.usersAreFriends(fromUser.id, toUser.id);
		if (!usersAreFriends)
			return ;

		const payloadToSend: DirectMessagePayload = {
			friendId: fromUser.id,
   			message: receivedPayload.message
		}
		toUser.socket.emit('challenge', payloadToSend);
	}

	gatewayUserToChatUser(gatewayUser: GatewayUser): ChatUser {
		const chatUser: ChatUser = {
			id: gatewayUser.id, 
			username: gatewayUser.username
		}
		return chatUser;
	}
}
