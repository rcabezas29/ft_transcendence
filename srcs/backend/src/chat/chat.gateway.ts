import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GatewayManagerGateway } from 'src/gateway-manager/gateway-manager.gateway';
import { GatewayManagerService } from 'src/gateway-manager/gateway-manager.service';
import { GatewayUser } from 'src/gateway-manager/interfaces/gateway-user.interface';
import { ChannelsService } from './channels.service';
import { ChatService } from './chat.service';
import { ChannelMessagePayload,
	DirectMessagePayload,
	PasswordChannelPayload,
	TimeUserChannelPayload,
	UserChannelPayload
} from './interfaces';

@WebSocketGateway({cors: true})
export class ChatGateway {
	constructor(
		private gatewayManagerGateway: GatewayManagerGateway,
		private gatewayManagerService: GatewayManagerService,
		private chatService: ChatService,
		private channelsService: ChannelsService
	) {}
	 
	@SubscribeMessage("direct-message")
	directMessage(client: Socket, payload: DirectMessagePayload): void {
		const fromUser: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.chatService.directMessage(fromUser, payload);
	}

	@SubscribeMessage("challenge")
	challenge(client: Socket, payload: DirectMessagePayload): void {
		const fromUser: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.chatService.challenge(fromUser, payload);
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
	joinChannel(client: Socket, payload: PasswordChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.userJoinChannel(user, payload);
	}

	@SubscribeMessage("leave-channel")
	leaveChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.userLeaveChannel(user, channelName, this.gatewayManagerGateway.server);
	}

	@SubscribeMessage("ban-user")
	banUser(client: Socket, payload: TimeUserChannelPayload): void {
		const banner: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const banned: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.banUser(banner, banned, payload.channelName, payload.time, this.gatewayManagerGateway.server);
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
		this.channelsService.setAdmin(user, newAdmin, payload.channelName, this.gatewayManagerGateway.server);
	}

	@SubscribeMessage("unset-admin")
	unsetAdmin(client: Socket, payload: UserChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const admin: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.unsetAdmin(user, admin, payload.channelName, this.gatewayManagerGateway.server);
	}

	@SubscribeMessage("set-password")
	setPassword(client: Socket, payload: PasswordChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.setPassword(user, payload, this.gatewayManagerGateway.server);
	}

	@SubscribeMessage("unset-password")
	unsetPassword(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		this.channelsService.unsetPassword(user, channelName, this.gatewayManagerGateway.server);
	}
}