import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChannelsService } from './channels.service';
import { MessagePayload } from './interfaces/message-payload.interface';

@WebSocketGateway({cors: true})
export class ChatGateway {
	constructor(
		private gatewayManagerService: GatewayManagerService,
		private channelsService: ChannelsService
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

	@SubscribeMessage("create-channel")
	createChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.createChannel(channelName, user);
	}

	@SubscribeMessage("join-channel")
	joinChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.userJoinChannel(user, channelName);
	}

	@SubscribeMessage("leave-channel")
	leaveChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.userLeaveChannel(user, channelName);
	}

}