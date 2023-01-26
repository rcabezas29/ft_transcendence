import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat } from "./interfaces";
import { user } from "./user";

type ChannelName = string;
type ChannelMap = {
    [id: ChannelName]: Chat; 
}

class ChannelController {
	public channels: ChannelName[] = [];
	public chats: ChannelMap = {};

	setEventsHandlers() {
		user.socket?.on("channel-created", (channelName) => this.onChannelCreated(channelName))
	}

	createChannel(name: ChannelName) {
		user.socket?.emit('create-channel', name);
	}

	onChannelCreated(name: ChannelName) {
		this.channels.push(name);
		this.appendChatToChatMap(name);
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