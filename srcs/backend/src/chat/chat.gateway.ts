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
	UserChannelNamePayload
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
	createChannel(client: Socket, payload: PasswordChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const created: boolean = this.channelsService.createChannel(payload, user);
		if (created) {
			this.channelsService.sendServerMessageToChannel(
				payload.channelName,
				this.gatewayManagerGateway.server,
				`user <${user.username}> created the channel.`
			);
		}
	}

	@SubscribeMessage("join-channel")
	joinChannel(client: Socket, payload: PasswordChannelPayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const joined: boolean = this.channelsService.userJoinChannel(user, payload);
		if (joined) {
			this.channelsService.sendServerMessageToChannel(
				payload.channelName,
				this.gatewayManagerGateway.server,
				`user <${user.username}> joined the channel.`
			);
		}
	}

	@SubscribeMessage("leave-channel")
	leaveChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const left: boolean = this.channelsService.userLeaveChannel(user, channelName, this.gatewayManagerGateway.server);
		if (left) {
			this.channelsService.sendServerMessageToChannel(
				channelName, 
				this.gatewayManagerGateway.server,
				`user <${user.username}> left the channel.`
			);
		}
	}

	@SubscribeMessage("ban-user")
	banUser(client: Socket, payload: TimeUserChannelPayload): void {
		const banner: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const banned: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		const bannedOK: boolean = this.channelsService.banUser(banner, banned, payload.channelName, payload.time, this.gatewayManagerGateway.server);
		if (bannedOK) {
			this.channelsService.sendServerMessageToChannel(
				payload.channelName, 
				this.gatewayManagerGateway.server,
				`user <${payload.user.username}> was banned for ${payload.time} seconds.`
			);
		}
	}

	@SubscribeMessage("mute-user")
	muteUser(client: Socket, payload: TimeUserChannelPayload): void {
		const muter: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const muted: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		const mutedOk: boolean = this.channelsService.muteUser(muter, muted, payload.channelName, payload.time);
		if (mutedOk) {
			this.channelsService.sendServerMessageToChannel(
				payload.channelName, 
				this.gatewayManagerGateway.server,
				`user <${payload.user.username}> was muted for ${payload.time} seconds.`
			);
		}
	}

	@SubscribeMessage("kick-user")
	kickUser(client: Socket, payload: UserChannelNamePayload): void {
		const kicker: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const kicked: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		const kickedOk: boolean = this.channelsService.kickUser(kicker, kicked, payload.channelName, this.gatewayManagerGateway.server);
		if (kickedOk) {
			this.channelsService.sendServerMessageToChannel(
				payload.channelName, 
				this.gatewayManagerGateway.server,
				`user <${payload.user.username}> was kicked from the channel.`
			);
		}
	}

	@SubscribeMessage("set-admin")
	setAdmin(client: Socket, payload: UserChannelNamePayload): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		const newAdmin: GatewayUser = this.gatewayManagerService.getClientByUserId(payload.user.id);
		this.channelsService.setAdmin(user, newAdmin, payload.channelName, this.gatewayManagerGateway.server);
	}

	@SubscribeMessage("unset-admin")
	unsetAdmin(client: Socket, payload: UserChannelNamePayload): void {
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

	@SubscribeMessage("delete-channel")
	deleteChannel(client: Socket, channelName: string): void {
		const user: GatewayUser = this.gatewayManagerService.getClientBySocketId(client.id);
		if (!this.gatewayManagerService.clientIsWebsiteAdmin(user))
			return;
		this.channelsService.deleteChannel(channelName, this.gatewayManagerGateway.server);
	}
}