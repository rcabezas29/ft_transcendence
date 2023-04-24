import { Injectable } from "@nestjs/common";
import { GatewayManagerService } from "src/gateway-manager/gateway-manager.service";
import { GatewayUser } from "src/gateway-manager/interfaces/gateway-user.interface";
import { ChatService } from "./chat.service";
import Channel from "./channel.class";
import { ChannelMessagePayload,
	ChannelPayload,
	ChatUser,
	PasswordBoolChannelPayload,
	PasswordChannelPayload,
	TimeUserChannelPayload,
	UserArrayChannelPayload,
	UserChannelNamePayload,
	UserIdChannelPayload
} from "./interfaces";
import { Server } from 'socket.io';

@Injectable()
export class ChannelsService {
	
	private channels: Channel[] = [];

	constructor(
		private chatService: ChatService,
        private gatewayManagerService: GatewayManagerService,
    ) {
        this.gatewayManagerService.addOnNewConnectionCallback((client: GatewayUser) => this.onNewConnection(client));
	}
	
    onNewConnection(client: GatewayUser): void {
		this.channels.forEach((channel) => {
			const userInChannel = channel.users.find((u) => u.id == client.id);
			if (userInChannel) {
				channel.replaceUser(userInChannel, client);
				client.socket.join(channel.name);
			} else if (this.gatewayManagerService.clientIsWebsiteAdmin(client)) {
				client.socket.join(channel.name);
			}
		})
		const channelsPayload: ChannelPayload[] = this.channels.map(channel => this.channelToChannelPayload(channel));
		client.socket.emit('all-channels', channelsPayload);
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

		const admins: GatewayUser[] = this.gatewayManagerService.getAllWebsiteAdminClients();
		admins.forEach((admin) => {
			admin.socket.join(channelName);
		})
		
		const channelPayload: ChannelPayload = this.channelToChannelPayload(newChannel);
		owner.socket.broadcast.emit('new-channel', channelPayload);
	}

	userJoinChannel(user: GatewayUser, payload: PasswordChannelPayload): boolean {
		const channel: Channel = this.getChannelbyName(payload.channelName);
		if (!channel)
			return false;

		if (channel.password != null && payload.password !== channel.password) {
			user.socket.emit('wrong-password', payload.channelName);
			return false;
		}

		if (user.id in channel.bannedUsers) {
			const remainingTime: number = channel.checkRemainingUserBanTime(user);
			const clientPayload: TimeUserChannelPayload = {
				user: {id: user.id, username: user.username},
				time: remainingTime,
				channelName: payload.channelName
			}
			if (remainingTime > 0) {
				user.socket.emit('user-banned', clientPayload);
				return false;
			}
		}

		channel.addUser(user);
		user.socket.join(payload.channelName);

		const channelPayload: ChannelPayload = this.channelToChannelPayload(channel);
		user.socket.emit('channel-joined', channelPayload);

		const newUserPayload: UserChannelNamePayload = {
			user: this.chatService.gatewayUserToChatUser(user),
			channelName: payload.channelName
		}
		user.socket.to(payload.channelName).emit('new-user-joined', newUserPayload);

		return true;
	}

	userLeaveChannel(user: GatewayUser, channelName: string, server: Server): boolean {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(user))
			return false;

		this.removeUserFromChannel(user, channel);

		if (channel.users.length == 0) {
			this.deleteChannel(channel.name, server);
			return false;
		}

		this.userLeaveSocketRoom(user, channelName);
		
		return true;
	}

	channelMessage(fromUser: GatewayUser, payload: ChannelMessagePayload): void {
		const channel: Channel = this.getChannelbyName(payload.channel);
		if (!channel || !channel.hasUser(fromUser))
			return ;

		if (fromUser.id in channel.mutedUsers) {
			const remainingTime: number = channel.checkRemainingUserMuteTime(fromUser);
			const payload: TimeUserChannelPayload = {
				user: {id: fromUser.id, username: fromUser.username},
				time: remainingTime,
				channelName: channel.name
			}
			if (remainingTime > 0) {
				fromUser.socket.emit('user-muted', payload);
				return;
			}
		}

		console.log("sending messagee from: ", payload.from)
		//payload.from = fromUser.username;
		channel.addMessage({message: payload.message, from: payload.from});
		fromUser.socket.to(payload.channel).emit("channel-message", payload);
	}

	banUser(bannerUser: GatewayUser, bannedUser: GatewayUser, channelName: string, time: number, server: Server): boolean {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(bannedUser))
			return false;

		if (!this.gatewayManagerService.clientIsWebsiteAdmin(bannerUser)) {
			if (!channel.userIsAdmin(bannerUser) || !channel.hasUser(bannerUser))
				return false;
		}

		channel.banUser(bannedUser, time);

		this.removeUserFromChannel(bannedUser, channel);

		if (channel.users.length == 0) {
			this.deleteChannel(channel.name, server);
			return false;
		}
		
		this.userLeaveSocketRoom(bannedUser, channelName);

		return true;
	}

	muteUser(muterUser: GatewayUser, mutedUser: GatewayUser, channelName: string, time: number): boolean {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(mutedUser))
			return false;

		if (!this.gatewayManagerService.clientIsWebsiteAdmin(muterUser)) {
			if (!channel.userIsAdmin(muterUser) || !channel.hasUser(muterUser))
				return false;
		}
		
		channel.muteUser(mutedUser, time);

		return true;
	}

	kickUser(kickerUser: GatewayUser, kickedUser: GatewayUser, channelName: string, server: Server): boolean {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(kickedUser))
			return false;

		if (!this.gatewayManagerService.clientIsWebsiteAdmin(kickerUser)) {
			if (!channel.userIsAdmin(kickerUser) || !channel.hasUser(kickerUser))
				return false;
		}

		this.removeUserFromChannel(kickedUser, channel);

		if (channel.users.length == 0) {
			this.deleteChannel(channel.name, server);
			return false;
		}

		this.userLeaveSocketRoom(kickedUser, channelName);

		return true;
	}

	setAdmin(user: GatewayUser, newAdmin: GatewayUser, channelName: string, server: Server): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel || !channel.hasUser(newAdmin))
			return;

		if (!this.gatewayManagerService.clientIsWebsiteAdmin(user)) {
			if (user != channel.owner || !channel.hasUser(user))
				return;
		}

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
		if (!channel || !channel.hasUser(admin))
			return;

		if (!this.gatewayManagerService.clientIsWebsiteAdmin(user)) {
			if (user != channel.owner || !channel.hasUser(user))
				return;
		}
		
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

	deleteChannel(channelName: string, server: Server): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return;

		channel.users.forEach((user) => {
			user.socket.leave(channel.name);
		})
		this.channels = this.channels.filter((c) => c.name != channel.name);
		server.emit('deleted-channel', channel.name);
	}

	sendServerMessageToChannel(channelName: string, server: Server, message: string): void {
		const channel: Channel = this.getChannelbyName(channelName);
		if (!channel)
			return ;

		const from: ChatUser = {
			id: -1,
			username: `#${channelName} server`
		}

		const payload: ChannelMessagePayload = {
			channel: channelName,
			from,
			message
		}
		channel.addMessage({message, from: payload.from});
		server.to(channelName).emit("channel-message", payload);
	}

	private removeUserFromChannel(user: GatewayUser, channel: Channel): void {
		channel.removeUser(user);

		const channelPayload: ChannelPayload = this.channelToChannelPayload(channel);

		user.socket.emit('channel-left', channelPayload);

		const payload: UserIdChannelPayload = {
			userId: user.id,
			channel: channelPayload
		}
		user.socket.to(channel.name).emit('user-left', payload);
	}

	private channelToChannelPayload(channel: Channel): ChannelPayload {
		const payload: ChannelPayload = {
			name: channel.name,
			users: channel.users.map((user) => this.chatService.gatewayUserToChatUser(user)),
			owner: this.chatService.gatewayUserToChatUser(channel.owner),
			admins: channel.admins.map((user) => this.chatService.gatewayUserToChatUser(user)),
			isPrivate: channel.password === null ? false : true,
			messages: channel.messages
		};
		return payload;
	}
	
	private userLeaveSocketRoom(user: GatewayUser, channelName: string): void {
		if (!this.gatewayManagerService.clientIsWebsiteAdmin(user))
			user.socket.leave(channelName);
	}

}
