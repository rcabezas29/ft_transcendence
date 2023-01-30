import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel, ChatUser } from "./interfaces";
import { user } from "./user";

type ChannelName = string;
type ChannelMap = {
    [id: ChannelName]: Chat; 
}

class ChannelController {
	public channels: Channel[] = [];
	public allChannels: Channel[] = [];
	public chats: ChannelMap = {};

	setEventsHandlers() {
        user.socket?.on('all-channels', (payload: Channel[]) => {this.onAllChannels(payload)});
		user.socket?.on('channel-created', (channel: Channel) => this.onChannelCreated(channel));
		user.socket?.on('new-channel', (channel: Channel) => this.onNewChannel(channel));
		user.socket?.on('channel-joined', (channel: Channel) => this.onChannelJoined(channel));
		// COn eSTO QUIERO AVISAR AL RESTO DE GENTE DE QUE ALGUIEN NUEVO SE HA UNIDO AL CANAL, PERO NO FUNCIONA: 
		user.socket?.on('new-user-joined', (channel: Channel) => this.onNewUserJoined(channel));
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	joinChannel(channelName: ChannelName) {
		user.socket?.emit('join-channel', channelName);
	}

	private onAllChannels(payload: Channel[]) {
		this.allChannels = payload;
	}

	private onChannelCreated(newChannel: Channel) {
		this.channels.push(newChannel);
		this.allChannels.push(newChannel);
		this.appendChatToChatMap(newChannel.name);
	}

	private onNewChannel(channel: Channel) {
		this.allChannels.push(channel);
	}

	private onChannelJoined(channel: Channel) {
		this.channels.push(channel);
		this.appendChatToChatMap(channel.name);
	}

	private onNewUserJoined(channel: Channel) {
		const index = this.channels.findIndex(c => c.name == channel.name);
		this.channels[index] = channel;
		//if (this.chats[channel.name] === currentChat.value)
		//	currentChat.value = 
	}

	setCurrentChat(channelName: ChannelName) {
		const chat = this.chats[channelName];
		if (chat === currentChat.value)
			currentChat.value = null;
		else {
			currentChat.value = chat;
			chat.notification = false;
		}
	}

	findChannelFromChannelName(channelName: ChannelName): Channel | null {
		const channel = this.channels.find((c) => c.name === channelName);
		if (channel)
			return channel;
		return null;
	}

	//FIXME: user != ChatUser
	userIsChannelOwner(channel: Channel, channelUser: ChatUser = user): boolean {
		return (channel.owner === channelUser);
	}

	userIsChannelAdmin(channel: Channel, channelUser: ChatUser = user): boolean {
		return channel.admins.includes(channelUser);
	}

	userIsMemberOfChannel(channelName: ChannelName, channelUser: ChatUser = {id: user.id, username: user.username}): boolean {
		const channel = this.findChannelFromChannelName(channelName);
		if (channel && channel.users.find(u => u.id == channelUser.id))
			return true;
		return false;
	}

	private appendChatToChatMap(channelName: ChannelName): void {
        if (this.chats && !this.chats[channelName])
        {
            const newChat: Chat = {
                target: channelName,
                messages: [],
                notification: false
            }
            this.chats[channelName] = newChat;
        }
    }
}

export const channelController = reactive<ChannelController>(new ChannelController());