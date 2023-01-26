import { reactive } from "vue";
import { currentChat } from "./currentChat";
import type { Chat } from "./interfaces";
import type { ChatUser } from "./interfaces/friend.interface";
import { user } from "./user";

interface Channel {
	name: string;
	users: ChatUser[];
}

type ChannelName = string;
type ChannelMap = {
    [id: ChannelName]: Chat; 
}

class ChannelController {
	public channels: Channel[] = [];
	public chats: ChannelMap = {};

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
			}]
		}
		this.channels.push(newChannel);
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