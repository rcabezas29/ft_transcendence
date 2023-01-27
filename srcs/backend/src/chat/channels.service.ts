import { Injectable } from "@nestjs/common";
import { GatewayManagerService } from "src/gateway-manager/gateway-manager.service";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import Channel from "./channel.class";
import { ChatService } from "./chat.service";
import { ChatUser } from "./interfaces/friend.interface";

interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	password: string;
}

@Injectable()
export class ChannelsService {
	
	private channels: Channel[] = [];

	constructor(
		private chatService: ChatService,
        private gatewayManagerService: GatewayManagerService
    ) {
        this.gatewayManagerService.addOnNewConnectionCallback((client: GatewayUser) => this.onNewConnection(client));
        this.gatewayManagerService.addOnDisconnectionCallback((client: GatewayUser) => this.onDisconnection(client));
    }

    onNewConnection(client: GatewayUser) {
		const channelsPayload: ChannelPayload[] = this.channels.map(channel => this.channelToChannelPayload(channel));
		client.socket.emit('all-channels', channelsPayload);
	}

	onDisconnection(client: GatewayUser) {
		this.channels.forEach((channel) => channel.removeUser(client));
		this.channels = this.channels.filter((channel) => {
			return (channel.owner != client || channel.users.length > 1);
		});

		const channelsPayload: ChannelPayload[] = this.channels.map(channel => this.channelToChannelPayload(channel));
		client.socket.broadcast.emit('all-channels', channelsPayload);
	}

	createChannel(channelName: string, owner: GatewayUser): void {
		const newChannel: Channel = new Channel(channelName, owner);

		this.channels.push(newChannel);
		owner.socket.emit('channel-created', this.channelToChannelPayload(newChannel));

		const channelPayload: ChannelPayload = this.channelToChannelPayload(newChannel);
		owner.socket.broadcast.emit('new-channel', channelPayload);
	}

	userJoinChannel(user: GatewayUser, channelName: string): void {
		const channel: Channel = this.channels.find(channel => channel.name === channelName);
		channel.addUser(user);
		user.socket.emit('channel-joined', this.channelToChannelPayload(channel));

		// must send to channel members, not broadcast to everyone
		//user.socket.broadcast.emit('new-user-joined', this.channelToChannelPayload(channel));
	}

	private channelToChannelPayload(channel: Channel): ChannelPayload {
		const payload: ChannelPayload = {
			name: channel.name,
			users: channel.users.map((user) => this.chatService.gatewayUserToChatUser(user)),
			owner: this.chatService.gatewayUserToChatUser(channel.owner),
			admins: channel.admins.map((user) => this.chatService.gatewayUserToChatUser(user)),
			password: channel.password
		};
		return payload;
	}
}
