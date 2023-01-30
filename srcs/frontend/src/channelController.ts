import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel, ChatUser } from "./interfaces";
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
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	joinChannel(channelName: ChannelName) {
		user.socket?.emit('join-channel', channelName);
	}

	private onAllChannels(payload: ChannelPayload[]) {
		payload.forEach((channel) => {
			this.channels[channel.name] = {...channel, chat: null};
		});
	}

	private onChannelCreated(newChannel: ChannelPayload) {
		this.channels[newChannel.name] = {...newChannel, chat: null};
		this.appendChatToMap(newChannel.name);
	}

	private onNewChannel(channel: ChannelPayload) {
		this.channels[channel.name] = {...channel, chat: null};
	}

	private onChannelJoined(name: ChannelName) {
		this.channels[name].users.push({id: user.id, username: user.username});
		this.appendChatToMap(name);
	}

	private onNewUserJoined(newUserPayload: UserChannelPayload) {
		const {channelName, user} = newUserPayload;
		this.channels[channelName].users.push(user);
	}

	setCurrentChat(channelName: ChannelName) {
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
		return (channel.owner === channelUser);
	}

	userIsChannelAdmin(channel: Channel, channelUser: ChatUser = {id: user.id, username: user.username}): boolean {
		if (channel.admins.find(user => user.id === channelUser.id))
			return true;
		return false;
	}

	userIsMemberOfChannel(channelName: ChannelName, channelUser: ChatUser = {id: user.id, username: user.username}): boolean {
		const channel = this.channels[channelName];
		if (channel && channel.users.find(u => u.id === channelUser.id))
			return true;
		return false;
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