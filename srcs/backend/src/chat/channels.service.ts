import { Injectable } from "@nestjs/common";
import { GatewayManagerService } from "src/gateway-manager/gateway-manager.service";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import { ChatService } from "./chat.service";
import Channel from "./channel.class";
import { ChannelMessagePayload,
	ChatUser,
	PasswordBoolChannelPayload,
	PasswordChannelPayload,
	TimeUserChannelPayload,
	UserArrayChannelPayload,
	UserChannelPayload
} from "./interfaces";
import { Server } from 'socket.io';


interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	isPrivate: boolean;
}

interface ChannelUserPayload {
	channel: ChannelPayload;
	username: string;
}

@Injectable()
export class ChannelsService {
	
	private channels: Channel[] = [];

	constructor(
		private chatService: ChatService,
        private gatewayManagerService: GatewayManagerService
    ) {
        this.gatewayManagerService.addOnNewConnectionCallback((client: GatewayUser) => this.onNewConnection(client));
        this.gatewayManagerService.addOnDisconnectionCallback((client: GatewayUser, server: Server) => this.onDisconnection(client, server));
	}
	
    onNewConnection(client: GatewayUser): void {
		const channelsPayload: ChannelPayload[] = this.channels.map(channel => this.channelToChannelPayload(channel));
		client.socket.emit('all-channels', channelsPayload);
	}

	onDisconnection(client: GatewayUser, server: Server): void {
		this.channels.forEach((channel) => {
			if (channel.users.find((user) => user.id == client.id)){
				if (this.deleteChannelIfWillBeEmpty(client, channel, server) === false)
					this.removeUserFromChannel(client, channel);
			}
		});
	}

	getChannelbyName(channelName: string): Channel | null {
		const channel: Channel | undefined = this.channels.find((channel) => channel.name === channelName);
		if (channel)
			return channel;
		return null;
	}

	createChannel(payload: PasswordChannelPayload, owner: GatewayUser): void {
		const { channelName, password } = payload;
		if (this.getChannelbyName(channelName))
			return;

		const newChannel: Channel = new Channel(channelName, owner);
		if (password != "")
			newChannel.setPassword(payload.password);

		this.channels.push(newChannel);
		owner.socket.emit('channel-created', this.channelToChannelPayload(newChannel));

		owner.socket.join(channelName);

		const channelPayload: ChannelPayload = this.channelToChannelPayload(newChannel);
		owner.socket.broadcast.emit('new-channel', channelPayload);
	}

	userJoinChannel(user: GatewayUser, payload: PasswordChannelPayload): void {
		const channel: Channel = this.getChannelbyName(payload.channelName);
		if (!channel)
			return;

		if (channel.password != null && payload.password !== channel.password)
		{
			user.socket.emit('wrong-password', payload.channelName);
			return;
		}

		if (user.id in channel.bannedUsers)
		{
			const remainingTime: number = channel.checkRemainingUserBanTime(user);
			const clientPayload: TimeUserChannelPayload = {
				user: {id: user.id, username: user.username},
				time: remainingTime,
				channelName: payload.channelName
			}
			if (remainingTime > 0)
			{
				user.socket.emit('user-banned', clientPayload);
				return;
			}
		}

		channel.addUser(user);
		user.socket.join(payload.channelName);
		user.socket.emit('channel-joined', payload.channelName);

		const newUserPayload: UserChannelPayload = {
			user: this.chatService.gatewayUserToChatUser(user),
			channelName: payload.channelName
		}
		user.socket.to(payload.channelName).emit('new-user-joined', newUserPayload);
	}

	userLeaveChannel(user: GatewayUser, channelName: string, server: Server): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(user))
			return;

		if (this.deleteChannelIfWillBeEmpty(user, channel, server) === false)
			this.removeUserFromChannel(user, channel);

		user.socket.leave(channelName);
	}

	channelMessage(fromUser: GatewayUser, payload: ChannelMessagePayload): void {
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

	banUser(bannerUser: GatewayUser, bannedUser: GatewayUser, channelName: string, time: number, server: Server): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (!channel.userIsAdmin(bannerUser) || !channel.hasUser(bannerUser) || !channel.hasUser(bannedUser))
			return;

		channel.banUser(bannedUser, time);

		if (this.deleteChannelIfWillBeEmpty(bannedUser, channel, server) === false)
			this.removeUserFromChannel(bannedUser, channel);
		
		bannedUser.socket.leave(channelName);
	}

	muteUser(muterUser: GatewayUser, mutedUser: GatewayUser, channelName: string, time: number): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (!channel.userIsAdmin(muterUser) || !channel.hasUser(muterUser) || !channel.hasUser(mutedUser))
			return;

		channel.muteUser(mutedUser, time);
	}

	setAdmin(user: GatewayUser, newAdmin: GatewayUser, channelName: string, server: Server): void {
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
		server.emit('admins-updated', payload);
	}

	unsetAdmin(user: GatewayUser, admin: GatewayUser, channelName: string, server: Server): void {
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
		server.emit('admins-updated', payload);
	}

	setPassword(user: GatewayUser, payload: PasswordChannelPayload, server: Server): void {
		const channel: Channel = this.getChannelbyName(payload.channelName);
		if (!channel)
			return;
		if (user != channel.owner || !channel.hasUser(user))
			return;
		
		channel.setPassword(payload.password);

		const clientPayload: PasswordBoolChannelPayload = {
			password: true,
			channelName: channel.name
		}
		server.emit('password-updated', clientPayload)
	}

	unsetPassword(user: GatewayUser, channelName: string, server: Server): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;
		if (user != channel.owner || !channel.hasUser(user))
			return;

		channel.unsetPassword();

		const clientPayload: PasswordBoolChannelPayload = {
			password: false,
			channelName: channelName
		}
		server.emit('password-updated', clientPayload)
	}

	private removeUserFromChannel(user: GatewayUser, channel: Channel): void {
		channel.removeUser(user);
		user.socket.emit('channel-left', this.channelToChannelPayload(channel));

		const payload: ChannelUserPayload = {
			channel: this.channelToChannelPayload(channel),
			username: user.username
		}
		user.socket.to(channel.name).emit('user-left', payload);
	}

	private deleteChannelIfWillBeEmpty(user: GatewayUser, channel: Channel, server: Server): boolean {
		if (channel.owner == user && channel.users.length == 1)
		{
			this.channels = this.channels.filter((c) => c.name != channel.name);
			server.emit('deleted-channel', channel.name)
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
			isPrivate: channel.password === null ? false : true
		};
		return payload;
	}
}
