import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel, ChatUser, Message } from "./interfaces";
import { user } from "./user";

interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
	isPrivate: boolean;
}

interface UserChannelPayload {
	user: ChatUser,
	channelName: ChannelName
}

interface UserArrayChannelPayload {
	users: ChatUser[],
	channelName: string
}

interface TimeUserChannelPayload {
	user: ChatUser,
	time: number,
	channelName: ChannelName
}

interface ChannelMessagePayload {
	channel: string;
	from: string;
	message: string;
}

interface PasswordChannelPayload {
	password: string,
	channelName: ChannelName
}

interface PasswordBoolChannelPayload {
	password: boolean,
	channelName: ChannelName
}

interface ChannelUserPayload {
	channel: ChannelPayload;
	username: string;
}

type ChannelName = string;
type ChannelMap = {
	[id: ChannelName]: Channel;
}

class ChannelController {
	public channels: ChannelMap = {};
	public userSelected: ChatUser | null = null;

	setEventsHandlers() {
        user.socket?.on('all-channels', (payload: ChannelPayload[]) => {this.onAllChannels(payload)});
		user.socket?.on('channel-created', (channel: ChannelPayload) => this.onChannelCreated(channel));
		user.socket?.on('new-channel', (channel: ChannelPayload) => this.onNewChannel(channel));
		user.socket?.on('channel-joined', (channelName: ChannelName) => this.onChannelJoined(channelName));
		user.socket?.on('new-user-joined', (newUserPayload: UserChannelPayload) => this.onNewUserJoined(newUserPayload));
		user.socket?.on('deleted-channel', (channelName: ChannelName) => this.onDeletedChannel(channelName));
		user.socket?.on('channel-left', (channel: ChannelPayload) => this.onChannelLeft(channel));
		user.socket?.on('user-left', (payload: ChannelUserPayload) => this.onUserLeft(payload));
		user.socket?.on('channel-message', (message: ChannelMessagePayload) => this.receiveChannelMessage(message));
		user.socket?.on('user-banned', (payload: TimeUserChannelPayload) => this.onUserBanned(payload));
		user.socket?.on('user-muted', (payload: TimeUserChannelPayload) => this.onUserMuted(payload));
		user.socket?.on('admins-updated', (payload: UserArrayChannelPayload) => this.onAdminsUpdated(payload));
		user.socket?.on('password-updated', (payload: PasswordBoolChannelPayload) => this.onPasswordUpdated(payload));
		user.socket?.on('wrong-password', (channelName: ChannelName) => this.onWrongPassword(channelName));
	}

	createChannel(channelName: ChannelName, password: string = ""): boolean {
		if (channelName in this.channels)
			return false;

		const payload: PasswordChannelPayload = { password, channelName };
		user.socket?.emit('create-channel', payload);
		return true;
	}

	joinChannel(channelName: ChannelName, password: string = ""): void {
		if (this.userIsMemberOfChannel(channelName))
			return;
			
		const payload: PasswordChannelPayload = { password, channelName };
		user.socket?.emit('join-channel', payload);
	}

	leaveChannel(channelName: ChannelName): void {
		user.socket?.emit('leave-channel', channelName);
	}

	sendChannelMessage(message: string): void {
        const toChannel: ChannelName = (<ChannelName>currentChat.value!.target);
        const payload: ChannelMessagePayload = {
            channel: toChannel,
			from: user.username,
			message: message
        };
        user.socket?.emit('channel-message', payload);

		this.addMessageToChannelChat(toChannel, "you", payload.message);
    }

	banUser(bannedUser: ChatUser, channelName: ChannelName, time: string): void {
		if (!this.userIsChannelAdmin(this.channels[channelName]))
			return this.alertError('you are not allowed to ban users');
		
		if (bannedUser.id == user.id)
			return this.alertError('you cannot ban yourself!');

		if (this.userIsChannelOwner(this.channels[channelName], bannedUser))
			return this.alertError('the channel owner is untouchable!');

		const banTime: number = +time;
		if (banTime === 0 || isNaN(banTime))
			return this.alertError('please insert a valid number (ban time)');

		const payload: TimeUserChannelPayload = {
			user: bannedUser,
			time: banTime,
			channelName: channelName
		}
		user.socket?.emit('ban-user', payload);
	}

	muteUser(mutedUser: ChatUser, channelName: ChannelName, time: string): void {
		if (!this.userIsChannelAdmin(this.channels[channelName]))
			return this.alertError('you are not allowed to mute users');

		if (mutedUser.id == user.id)
			return this.alertError('you cannot mute yourself!');

		if (this.userIsChannelOwner(this.channels[channelName], mutedUser))
			return this.alertError('the channel owner is untouchable!');

		const muteTime: number = +time;
		if (muteTime === 0 || isNaN(muteTime))
			return this.alertError('please insert a valid number (mute time)');

		const payload: TimeUserChannelPayload = {
			user: mutedUser,
			time: muteTime,
			channelName: channelName
		}
		user.socket?.emit('mute-user', payload);
	}

	makeChannelAdmin(newAdmin: ChatUser, channelName: ChannelName): void {
		if (this.userIsChannelAdmin(this.channels[channelName], newAdmin))
			return;

		if (!this.userIsChannelOwner(this.channels[channelName]))
			return this.alertError('you are not allowed to manage channel administrators');
		
		if (this.userIsChannelOwner(this.channels[channelName], newAdmin))
			return this.alertError('the channel owner is untouchable!');

		const payload: UserChannelPayload = { user: newAdmin, channelName };
		user.socket?.emit('set-admin', payload);
	}

	removeChannelAdmin(admin: ChatUser, channelName: ChannelName): void {
		if (!this.userIsChannelAdmin(this.channels[channelName], admin))
			return;

		if (!this.userIsChannelOwner(this.channels[channelName]))
			return this.alertError('you are not allowed to manage channel administrators');
		
		if (this.userIsChannelOwner(this.channels[channelName], admin))
			return this.alertError('the channel owner is untouchable!');

		const payload: UserChannelPayload = { user: admin, channelName };
		user.socket?.emit('unset-admin', payload);
	}

	setPassword(password: string, channelName: ChannelName): void {
		if (!this.userIsChannelOwner(this.channels[channelName]))
			return this.alertError('you are not allowed to manage this channel\'s password');
		
		if (password.length === 0)
			return this.alertError(`please enter a password for channel '${channelName}'`);

		const payload: PasswordChannelPayload = { password, channelName };
		user.socket?.emit('set-password', payload);
	}

	unsetPassword(channelName: ChannelName): void {
		if (!this.userIsChannelOwner(this.channels[channelName]))
			return this.alertError('you are not allowed to manage this channel\'s password');
		if (this.channels[channelName].isPrivate === false)
			return;

		user.socket?.emit('unset-password', channelName);
	}

	private onAllChannels(payload: ChannelPayload[]): void {
		payload.forEach((channel) => {
			this.channels[channel.name] = {...channel, chat: null};
		});
	}

	private onChannelCreated(newChannel: ChannelPayload): void {
		this.channels[newChannel.name] = {...newChannel, chat: null};
		this.appendChatToMap(newChannel.name);
	}

	private onNewChannel(channel: ChannelPayload): void {
		this.channels[channel.name] = {...channel, chat: null};
	}

	private onChannelJoined(name: ChannelName): void {
		this.channels[name].users.push({id: user.id, username: user.username});
		this.appendChatToMap(name);
	}

	private onNewUserJoined(newUserPayload: UserChannelPayload): void {
		const {channelName, user} = newUserPayload;
		this.channels[channelName].users.push(user);
		this.addMessageToChannelChat(channelName, `#${channelName}`, `user <${user.username}> joined the channel.`);
	}

	private onDeletedChannel(channelName: ChannelName): void {
		delete(this.channels[channelName]);
		if (currentChat.value?.target === channelName)
			currentChat.value = null;
	}

	private onChannelLeft(channel: ChannelPayload): void {
		this.channels[channel.name] = {...channel, chat: null};
		if (currentChat.value?.target === channel.name)
			currentChat.value = null;
	}

	private onUserLeft(payload: ChannelUserPayload): void {
		const { channel, username } = payload;
		this.channels[channel.name] = {...channel, chat: this.channels[channel.name].chat};
		this.addMessageToChannelChat(channel.name, `#${channel.name}`, `user <${username}> left the channel.`);
	}

	private receiveChannelMessage(payload: ChannelMessagePayload): void {
		this.addMessageToChannelChat(payload.channel, payload.from, payload.message);
	}

	private onUserBanned(payload: TimeUserChannelPayload): void {
		return this.alertError(`oops! you are banned from '${payload.channelName}'. Remaining ban time: ${payload.time} seconds`);
	}

	private onUserMuted(payload: TimeUserChannelPayload): void {
		return this.alertError(`oops! you are muted from '${payload.channelName}'. Your message has NOT been sent. Remaining mute time: ${payload.time} seconds`);
	}

	private onAdminsUpdated(payload: UserArrayChannelPayload): void {
		this.channels[payload.channelName].admins = payload.users;
	}

	private onPasswordUpdated(payload: PasswordBoolChannelPayload): void {
		this.channels[payload.channelName].isPrivate = payload.password;
	}

	private onWrongPassword(channelName: ChannelName): void {
		return this.alertError(`oops! wrong password for private channel '${channelName}'. Try again`);
	}

	setCurrentChat(channelName: ChannelName): void {
		const chat = this.channels[channelName].chat;
		if (!chat)
			return;
		if (chat === currentChat.value)
			currentChat.value = null;
		else {
			currentChat.value = chat;
			chat.notification = false;
			chat.challenge = false;
		}
	}

	userIsChannelOwner(channel: Channel, channelUser: ChatUser = {id: user.id, username: user.username}): boolean {
		return (channel.owner.id === channelUser.id);
	}

	userIsChannelAdmin(channel: Channel, channelUser: ChatUser = {id: user.id, username: user.username}): boolean {
		if (channel.admins.find(user => user.id === channelUser.id))
			return true;
		return false;
	}

	userIsMemberOfChannel(channelName: ChannelName, channelUser: ChatUser = {id: user.id, username: user.username}): boolean | null {
		const channel = this.channels[channelName];
		if (!channel)
			return null;
		if (channel.users.find(u => u.id === channelUser.id))
			return true;
		return false;
	}

	private alertError(errorMessage: string): void {
		alert(errorMessage);
	}

	private addMessageToChannelChat(channelName: ChannelName, fromUser: string, message: string): void {
		const channel = this.channels[channelName];
		if (!channel)
			return;

		const newMessage: Message = {
            from: fromUser,
            message: message
        }

        const chat: Chat | null = channel.chat;
        if (chat)
		{
			chat.messages.push(newMessage);
			if (chat !== currentChat.value)
				chat.notification = true;
		}
	}

	private appendChatToMap(channelName: ChannelName): void {
        if (this.channels && !this.channels[channelName].chat)
        {
            const newChat: Chat = {
                target: channelName,
                messages: [],
                notification: false,
				challenge: false
            }
            this.channels[channelName].chat = newChat;
        }
    }

	selectUser(user: ChatUser): void {
		this.userSelected = user;
	}
	
	unselectUser(): void {
		this.userSelected = null;
	}
	
	isUserSelected(user: ChatUser): boolean {
		return (user === this.userSelected);
	}
}

export const channelController = reactive<ChannelController>(new ChannelController());