import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel, ChatUser } from "./interfaces";
import { user } from "./user";

type ChannelName = string;
type ChannelMap = {
	[id: ChannelName]: Channel;
}

class ChannelController {
	public channels: ChannelMap = {};

	setEventsHandlers() {
        user.socket?.on('all-channels', (payload: Channel[]) => {this.onAllChannels(payload)});
		user.socket?.on('channel-created', (channel: Channel) => this.onChannelCreated(channel));
		user.socket?.on('new-channel', (channel: Channel) => this.onNewChannel(channel));
		user.socket?.on('channel-joined', (channel: Channel) => this.onChannelJoined(channel));
		user.socket?.on('new-user-joined', (channel: Channel) => this.onNewUserJoined(channel));
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	joinChannel(channelName: ChannelName) {
		user.socket?.emit('join-channel', channelName);
	}

	private onAllChannels(payload: Channel[]) {
		payload.forEach((channel) => {
			this.channels[channel.name] = channel;
		});
	}

	private onChannelCreated(newChannel: Channel) {
		this.channels[newChannel.name] = newChannel;
		this.appendChatToMap(newChannel.name);
	}

	private onNewChannel(channel: Channel) {
		this.channels[channel.name] = channel;
	}

	private onChannelJoined(channel: Channel) {
		this.channels[channel.name] = channel;
		this.appendChatToMap(channel.name);
	}

	private onNewUserJoined(channel: Channel) {
		this.channels[channel.name].users = channel.users;
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