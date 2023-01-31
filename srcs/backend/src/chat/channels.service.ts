import { Injectable } from "@nestjs/common";
import { GatewayManagerService } from "src/gateway-manager/gateway-manager.service";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import Channel from "./channel.class";
import { ChannelMessagePayload, ChatUser, TimeUserChannelPayload, UserArrayChannelPayload, UserChannelPayload } from "./interfaces";
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

		if (fromUser.id in channel.mutedUsers)
		{
			const remainingTime: number = channel.checkRemainingUserMuteTime(fromUser);
			const payload: TimeUserChannelPayload = {
				user: {id: fromUser.id, username: fromUser.username},
				time: remainingTime,
				channelName: channel.name
			}
			if (remainingTime > 0)
			{
				fromUser.socket.emit('user-muted', payload);
				return;
			}
		}

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

	muteUser(muterUser: GatewayUser, mutedUser: GatewayUser, channelName: string, time: number): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (!channel.userIsAdmin(muterUser) || !channel.hasUser(muterUser) || !channel.hasUser(mutedUser))
			return;

		channel.muteUser(mutedUser, time);
	}

	setAdmin(user: GatewayUser, newAdmin: GatewayUser, channelName: string): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (user != channel.owner || !channel.hasUser(user) || !channel.hasUser(newAdmin))
			return;

		channel.setAdmin(newAdmin);

		const admins: ChatUser[] = channel.admins.map((admin) => this.chatService.gatewayUserToChatUser(admin));
		const payload: UserArrayChannelPayload = {
			users: admins,
			channelName
		};

		// FIXME: server emit
		user.socket.broadcast.emit('admins-updated', payload);
		user.socket.emit('admins-updated', payload);
	}

	unsetAdmin(user: GatewayUser, admin: GatewayUser, channelName: string): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (user != channel.owner || !channel.hasUser(user) || !channel.hasUser(admin))
			return;
		
		channel.unsetAdmin(admin);

		const admins: ChatUser[] = channel.admins.map((admin) => this.chatService.gatewayUserToChatUser(admin));
		const payload: UserArrayChannelPayload = {
			users: admins,
			channelName
		};
		// FIXME: server emit
		user.socket.broadcast.emit('admins-updated', payload);
		user.socket.emit('admins-updated', payload);
	}

	private removeUserFromChannel(user: GatewayUser, channel: Channel): void {
		if (this.deleteChannelIfWillBeEmpty(user, channel) === false)
		{
			channel.removeUser(user);
			user.socket.to(channel.name).emit('user-left', this.channelToChannelPayload(channel));
		}
	}

	private deleteChannelIfWillBeEmpty(user: GatewayUser, channel: Channel): boolean {
		if (channel.owner == user && channel.users.length == 1)
		{
			this.channels = this.channels.filter((c) => c.name != channel.name);
			// FIXME: server emit
			user.socket.emit('deleted-channel', channel.name);
			user.socket.broadcast.emit('deleted-channel', channel.name);
			return true;
		}
		return false;
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
