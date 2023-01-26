import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat, Channel } from "./interfaces";
import { user } from "./user";

type ChannelName = string;
type ChannelMap = {
    [id: ChannelName]: Chat; 
}

class ChannelController {
	public channels: Channel[] = [];
	public chats: ChannelMap = {};
	public currentChannel: Channel | null = null;

	setEventsHandlers() {
		user.socket?.on("channel-created", (channelName) => this.onChannelCreated(channelName))
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	onChannelCreated(name: ChannelName) {
		const newChannel = {
			name: name,
			users: [{
				id: user.id,
				username: user.username
			},
			{
				id: 123,
				username: "ana"
			},
			{
				id: 124,
				username: "otro"
			}
		]
		}
		this.channels.push(newChannel);
		this.appendChatToChatMap(name);
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