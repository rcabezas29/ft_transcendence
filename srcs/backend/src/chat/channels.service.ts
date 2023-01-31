import { Injectable } from "@nestjs/common";
import { GatewayManagerService } from "src/gateway-manager/gateway-manager.service";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import Channel from "./channel.class";
import { ChannelMessagePayload, ChatUser, TimeUserChannelPayload, UserChannelPayload } from "./interfaces";
import { ChatService } from "./chat.service";

interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
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

	getChannelbyName(channelName: string): Channel | null {
		const channel: Channel | undefined = this.channels.find((channel) => channel.name === channelName);
		if (channel)
			return channel;
		return null;
	}

	channelMessage(fromUser: GatewayUser, payload: ChannelMessagePayload) {
		const channel: Channel = this.getChannelbyName(payload.channel);
		if (!channel || !channel.hasUser(fromUser))
			return ;

		//TODO: Check if user is muted
		//if muted, notify the user

		payload.from = fromUser.username;
		fromUser.socket.to(payload.channel).emit("channel-message", payload);
	}

    onNewConnection(client: GatewayUser): void {
		const channelsPayload: ChannelPayload[] = this.channels.map(channel => this.channelToChannelPayload(channel));
		client.socket.emit('all-channels', channelsPayload);
	}

	onDisconnection(client: GatewayUser): void {
		this.channels.forEach((channel) => {
			this.removeUserFromChannel(client, channel);
		});
	}

	createChannel(channelName: string, owner: GatewayUser): void {
		const newChannel: Channel = new Channel(channelName, owner);

		this.channels.push(newChannel);
		owner.socket.emit('channel-created', this.channelToChannelPayload(newChannel));

		owner.socket.join(channelName);

		const channelPayload: ChannelPayload = this.channelToChannelPayload(newChannel);
		owner.socket.broadcast.emit('new-channel', channelPayload);
	}

	userJoinChannel(user: GatewayUser, channelName: string): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;

		if (user.id in channel.bannedUsers)
		{
			const remainingTime: number = channel.checkRemainingUserBanTime(user);
			const payload: TimeUserChannelPayload = {
				user: {id: user.id, username: user.username},
				time: remainingTime,
				channelName: channelName
			}
			if (remainingTime > 0)
			{
				user.socket.emit('user-banned', payload);
				return;
			}
		}

		channel.addUser(user);
		user.socket.join(channelName);
		user.socket.emit('channel-joined', channelName);

		const newUserPayload: UserChannelPayload = {
			user: this.chatService.gatewayUserToChatUser(user),
			channelName: channelName
		}
		user.socket.to(channelName).emit('new-user-joined', newUserPayload);
	}

	userLeaveChannel(user: GatewayUser, channelName: string): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(user))
			return;

		this.removeUserFromChannel(user, channel);
		if (this.getChannelbyName(channelName)) // check in case the channel was removed too
			user.socket.emit('channel-left', this.channelToChannelPayload(channel));

		user.socket.leave(channelName);
	}

	banUser(bannerUser: GatewayUser, bannedUser: GatewayUser, channelName: string, time: number): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (!channel.userIsAdmin(bannerUser) || !channel.hasUser(bannerUser) || !channel.hasUser(bannedUser))
			return;

		channel.banUser(bannedUser, time);
		this.removeUserFromChannel(bannedUser, channel);
		bannedUser.socket.emit('channel-left', this.channelToChannelPayload(channel));
	}

	// TODO: podria devolver boolean segun si lo ha borrado (true) o si ha eliminado el canal (false) por ejemplo y mejorar userLeaveChannel
	// TODO: incluso meter el evento en la clase channel, y solo sacar la comrpobacion de borrar canales
	private removeUserFromChannel(user: GatewayUser, channel: Channel): void {
		channel.removeUser(user);
		user.socket.to(channel.name).emit('user-left', this.channelToChannelPayload(channel));

		if (channel.owner == user && channel.users.length < 1)
		{
			this.channels = this.channels.filter((c) => c.name != channel.name);
			user.socket.emit('deleted-channel', channel.name);
			user.socket.broadcast.emit('deleted-channel', channel.name);
		}
	}

	private channelToChannelPayload(channel: Channel): ChannelPayload {
		const payload: ChannelPayload = {
			name: channel.name,
			users: channel.users.map((user) => this.chatService.gatewayUserToChatUser(user)),
			owner: this.chatService.gatewayUserToChatUser(channel.owner),
			admins: channel.admins.map((user) => this.chatService.gatewayUserToChatUser(user)),
		};
		return payload;
	}
}
