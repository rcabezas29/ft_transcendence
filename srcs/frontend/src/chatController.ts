import { reactive } from "vue";
import { user } from "./user";

export interface Message {
	from: string;
	message: string;
}

export interface Friend {
    id: number;
    username: string;
}

export interface Chat {
    friend: Friend;
    messages: Message[];
    notification: boolean;
}

interface MessagePayload {
    friendId: FriendId;
    message: string;
}

type FriendId = number;
type ChatMap = {
    [id: FriendId]: Chat; 
}

class ChatController {
    public friends: Friend[] = [];
    public chats: ChatMap = {};
    public currentChat: Chat | null = null;

    setEventsHandlers() {
        user.socket?.on('connected-friends', (payload: Friend[]) => {this.onConnectedFriends(payload)});
        user.socket?.on('friend-online', (payload: Friend) => {this.onFriendConnected(payload)});
        user.socket?.on('friend-offline', (payload: Friend) => {this.onFriendDisconnected(payload)});
        user.socket?.on('direct-message', (payload: MessagePayload) => {this.receiveDirectMessage(payload)});
    }

    onConnectedFriends(payload: Friend[]) {
        this.friends = payload;
        this.friends = this.friends.filter((friend) => friend.id !== user.id);
        this.friends.forEach((friend) => { this.appendChatToChatMap(friend) });
    }

    onFriendConnected(payload: Friend) {
        this.friends.push(payload);
        this.appendChatToChatMap(payload);
    }

    onFriendDisconnected(payload: Friend) {
        this.friends = this.friends.filter((friend) => friend.id != payload.id);
    }

    receiveDirectMessage(payload: MessagePayload) {
        const fromUsername: Friend | undefined = this.friends.find((friend) => payload.friendId === friend.id);
        if (!fromUsername)
            return;
        const newMessage: Message = {
            from: fromUsername.username,
            message: payload.message
        }
        const friendChat: Chat | undefined = this.chats[fromUsername.id];
        if (friendChat)
            friendChat.messages.push(newMessage);

        if (friendChat !== this.currentChat)
            friendChat.notification = true;
    }

    sendDirectMessage(message: string) {
        const toFriendId: FriendId = this.currentChat!.friend.id;
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

    setCurrentChat(friendId: number) {
        const chat: Chat | undefined = this.chats[friendId];
        if (!chat)
            return;
        if (this.currentChat === chat)
            this.currentChat = null;
        else {
            this.currentChat = chat;
            this.currentChat.notification = false;
        }
    }

    hasCurrentChat(): boolean {
        return (this.currentChat !== null);
    }

    private appendChatToChatMap(friend: Friend): void {
        if (this.chats && !this.chats[friend.id])
        {
            const newChat: Chat = {
                friend: friend,
                messages: [],
                notification: false
            }
            this.chats[friend.id] = newChat;
        }
    }
}

export const chatController = reactive<ChatController>(new ChatController);