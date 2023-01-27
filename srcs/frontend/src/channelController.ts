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
	public currentChannel: Channel | null = null;

	setEventsHandlers() {
        user.socket?.on('all-channels', (payload: Channel[]) => {this.onAllChannels(payload)});
		user.socket?.on('channel-created', (channelName: ChannelName) => this.onChannelCreated(channelName))
		user.socket?.on('new-channel', (channel: Channel) => this.onNewChannel(channel))
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	private onAllChannels(payload: Channel[]) {
		this.allChannels = payload;
	}

	private onChannelCreated(name: ChannelName) {
		const newChannel = {
			name: name,
			users: [{
				id: user.id,
				username: user.username
			}],
			owner: user,
			admins: [user],
			password: ""
		}
		this.channels.push(newChannel);
		this.allChannels.push(newChannel);
		this.appendChatToChatMap(name);
	}

	private onNewChannel(channel: Channel) {
		this.allChannels.push(channel);
	}

	setCurrentChat(channelName: ChannelName) {
		const chat = this.chats[channelName];
		if (chat === currentChat.value)
		{
			currentChat.value = null;
			this.currentChannel = null;
		}
		else {
			currentChat.value = chat;
			chat.notification = false;
			this.currentChannel = this.channels.find(channel => channel.name === currentChat.value?.target) as Channel;
		}
	}

	userIsChannelOwner(channel: Channel, channelUser: ChatUser = user): boolean {
		return (channel.owner === channelUser);
	}

	userIsChannelAdmin(channel: Channel, channelUser: ChatUser = user): boolean {
		return channel.admins.includes(channelUser);
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