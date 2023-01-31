import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel, ChatUser } from "./interfaces";
import type { Message } from "./interfaces/message.interface";
import { user } from "./user";

interface ChannelPayload {
	name: string;
	users: ChatUser[];
	owner: ChatUser;
	admins: ChatUser[];
}

interface UserChannelPayload {
	user: ChatUser,
	channelName: ChannelName
}

interface ChannelMessagePayload {
	channel: string;
	from: string;
	message: string;
}

type ChannelName = string;
type ChannelMap = {
	[id: ChannelName]: Channel;
}

class ChannelController {
	public channels: ChannelMap = {};

	setEventsHandlers() {
        user.socket?.on('all-channels', (payload: ChannelPayload[]) => {this.onAllChannels(payload)});
		user.socket?.on('channel-created', (channel: ChannelPayload) => this.onChannelCreated(channel));
		user.socket?.on('new-channel', (channel: ChannelPayload) => this.onNewChannel(channel));
		user.socket?.on('channel-joined', (channelName: ChannelName) => this.onChannelJoined(channelName));
		user.socket?.on('new-user-joined', (newUserPayload: UserChannelPayload) => this.onNewUserJoined(newUserPayload));
		user.socket?.on('deleted-channel', (channelName: ChannelName) => this.onDeletedChannel(channelName));
		user.socket?.on('channel-left', (channel: ChannelPayload) => this.onChannelLeft(channel));
		user.socket?.on('user-left', (channel: ChannelPayload) => this.onUserLeft(channel));
		user.socket?.on('channel-message', (message: ChannelMessagePayload) => this.receiveChannelMessage(message));
	}

	createChannel(name: ChannelName): void {
		user.socket?.emit('create-channel', name);
	}

	joinChannel(channelName: ChannelName): void {
		user.socket?.emit('join-channel', channelName);
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

	private onUserLeft(channel: ChannelPayload): void {
		this.channels[channel.name] = {...channel, chat: this.channels[channel.name].chat};
	}

	private receiveChannelMessage(payload: ChannelMessagePayload): void {
		this.addMessageToChannelChat(payload.channel, payload.from, payload.message);
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
                notification: false
            }
            this.channels[channelName].chat = newChat;
        }
    }
}

export const channelController = reactive<ChannelController>(new ChannelController());