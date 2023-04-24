import { reactive } from "vue";
import type { Chat, ChatUser, Message } from "./interfaces";
import { user } from './user';
import { currentChat } from "./currentChat";
import router from "./router";
import type { UserUpdatedPayload } from "./friendsController";

interface MessagePayload {
    friendId: FriendId;
    message: string;
}

interface ChallengePlayers {
    user1Id: number,
    user2Id: number,
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
        user.socket?.on('challenge', (payload: MessagePayload) => {this.receiveChallenge(payload)});
        user.socket?.on('challenge-accepted', () => router.replace('game'));
        user.socket?.on('challenge-refused', (friendId) => {this.chats[friendId].challenge = false;});
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

    onUserUpdated(payload: UserUpdatedPayload) {
        const { id, username } = payload;
        const friend: ChatUser | undefined = this.findFriendById(id);
        if (!friend)
            return;
        friend.username = username;

        const friendChat: Chat | undefined = this.chats[id];
        if (friendChat)
            (<ChatUser>friendChat.target).username = username;
    }

    private receiveDirectMessage(payload: MessagePayload) {
        const fromUser: ChatUser | undefined = this.findFriendById(payload.friendId);
        if (!fromUser)
            return;

        const newMessage: Message = {
            from: fromUser,
            message: payload.message
        }
        const friendChat: Chat | undefined = this.chats[fromUser.id];
        if (friendChat)
            friendChat.messages.push(newMessage);

        if (friendChat !== currentChat.value)
            friendChat.notification = true;
    }

    private receiveChallenge(payload: MessagePayload) {
        const fromUser: ChatUser | undefined = this.friends.find((friend) => payload.friendId === friend.id);
        if (!fromUser)
            return ;
        const friendChat: Chat | undefined = this.chats[fromUser.id];

        friendChat.challenge = true;
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

        const from: ChatUser = {
            id: user.id,
            username: user.username
        }
        const newMessage: Message = {
            from,
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
                notification: false,
                challenge: false
            }
            this.chats[friend.id] = newChat;
        }
    }

    private findFriendById(id: number): ChatUser | undefined {
        return this.friends.find((friend) => id === friend.id);
    }

    sendChallenge() {
        const toFriendId: FriendId = (<ChatUser>currentChat.value!.target).id;
         const payload: MessagePayload = {
            friendId: toFriendId,
            message: 'challenge'
        };
        user.socket?.emit('challenge', payload);
    }

    acceptChallenge(friendId: number) {
        const challengePlayers: ChallengePlayers = {
            user1Id: friendId,
            user2Id: user.id,
        }
        user.socket?.emit('accept-challenge', challengePlayers);
        this.chats[friendId].challenge = false;
    }

    refuseChallenge(friendId: number) {
        user.socket?.emit('refuse-challenge', friendId);
        this.chats[friendId].challenge = false;
    }
};

export const directMessageController = reactive<DirectMessageController>(new DirectMessageController());