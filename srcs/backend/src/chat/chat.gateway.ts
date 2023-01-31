import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChannelsService } from './channels.service';
import { ChannelMessagePayload, DirectMessagePayload, TimeUserChannelPayload, UserChannelPayload } from './interfaces';

@WebSocketGateway({cors: true})
export class ChatGateway {
	constructor(
		private gatewayManagerService: GatewayManagerService,
		private channelsService: ChannelsService
	) {}
	 
	@SubscribeMessage("direct-message")
	directMessage(client: Socket, receivedPayload: DirectMessagePayload): void {
		const fromUser: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const toUser: GatewayUser = this.gatewayManagerService.getClientByUserId(receivedPayload.friendId);
		const payloadToSend: DirectMessagePayload = {
			friendId: fromUser.id,
   			message: receivedPayload.message
		}
		toUser.socket.emit('direct-message', payloadToSend);
	}

	@SubscribeMessage("channel-message")
	channelMessage(client: Socket, payload: ChannelMessagePayload): void {
		const fromUser: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.channelMessage(fromUser, payload);
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

	@SubscribeMessage("ban-user")
	banUser(client: Socket, payload: TimeUserChannelPayload): void {
		const banner: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const banned: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.banUser(banner, banned, payload.channelName, payload.time);
	}

	@SubscribeMessage("mute-user")
	muteUser(client: Socket, payload: TimeUserChannelPayload): void {
		const muter: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const muted: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.muteUser(muter, muted, payload.channelName, payload.time);
	}

	@SubscribeMessage("set-admin")
	setAdmin(client: Socket, payload: UserChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const newAdmin: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.setAdmin(user, newAdmin, payload.channelName);
	}

	@SubscribeMessage("unset-admin")
	unsetAdmin(client: Socket, payload: UserChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const admin: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.unsetAdmin(user, admin, payload.channelName);
	}
}