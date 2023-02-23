import { reactive } from "vue";
import type { Chat, ChatUser, Message } from "./interfaces";
import { user } from './user';
import { currentChat } from "./currentChat";

interface MessagePayload {
    friendId: FriendId;
    message: string;
}

type FriendId = number;
type ChatMap = {
    [id: FriendId]: Chat; 
}

class DirectMessageController {
    public friends: ChatUser[] = [];
	public chats: ChatMap = {};

	setEventsHandlers() {
        user.socket?.on('direct-message', (payload: MessagePayload) => {this.receiveDirectMessage(payload)});
    }

    onConnectedFriends(payload: ChatUser[]) {
        this.friends = payload;
        this.friends.forEach((friend) => { this.appendChatToChatMap(friend) });
    }

    onFriendConnected(payload: ChatUser) {
        this.friends.push(payload);
        this.appendChatToChatMap(payload);
    }

    onFriendDisconnected(payload: FriendId) {
        if (currentChat.value && (<ChatUser>currentChat.value.target).id === payload)
			currentChat.value = null;
        this.friends = this.friends.filter((friend) => friend.id != payload);
    }

    private receiveDirectMessage(payload: MessagePayload) {
        const fromUsername: ChatUser | undefined = this.friends.find((friend) => payload.friendId === friend.id);
        if (!fromUsername)
            return;
        const newMessage: Message = {
            from: fromUsername.username,
            message: payload.message
        }
        const friendChat: Chat | undefined = this.chats[fromUsername.id];
        if (friendChat)
            friendChat.messages.push(newMessage);

        if (friendChat !== currentChat.value)
            friendChat.notification = true;
    }

    sendDirectMessage(message: string) {
        const toFriendId: FriendId = (<ChatUser>currentChat.value!.target).id;
        const payload: MessagePayload = {
            friendId: toFriendId,
            message: message
        };
        user.socket?.emit('direct-message', payload);

        const newMessage: Message = {
            from: "you",
            message: message
        }
        const friendChat: Chat | undefined = this.chats[toFriendId];
        if (friendChat)
            friendChat.messages.push(newMessage);
    }

	setCurrentChat(friendId: FriendId) {
		const chat = this.chats[friendId];
		if (chat === currentChat.value)
			currentChat.value = null;
		else {
			currentChat.value = chat;
			chat.notification = false;
		}
	}

    private appendChatToChatMap(friend: ChatUser): void {
        if (this.chats && !this.chats[friend.id])
        {
            const newChat: Chat = {
                target: friend,
                messages: [],
                notification: false
            }
            this.chats[friend.id] = newChat;
        }
    }
};

export const directMessageController = reactive<DirectMessageController>(new DirectMessageController());