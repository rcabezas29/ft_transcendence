import { reactive } from "vue";
import type { Chat, ChatUser, Message } from "./interfaces";
import { user } from './user';
import { currentChat, unsetCurrentChat } from "./currentChat";
import router from "./router";
import type { UserUpdatedPayload } from "./friendsController";
import { globalChatNotification } from "./globalChatNotification";
import { ChallengeState } from "./interfaces/chat/chat.interface";

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
        user.socket?.on('challenge-accepted', (friendId: FriendId) => {this.onChallengeAccepted(friendId)});
        user.socket?.on('challenge-refused', (friendId: FriendId) => {this.onChallengeRefused(friendId)});
        user.socket?.on('challenge-canceled', (friendId: FriendId) => {this.onChallengeCanceled(friendId)});
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
			unsetCurrentChat();
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

        if (friendChat !== currentChat.value) {
            friendChat.notification = true;
            globalChatNotification.value = true;
        }
    }

    private receiveChallenge(payload: MessagePayload) {
        const fromUser: ChatUser | undefined = this.findFriendById(payload.friendId);
        if (!fromUser)
            return ;
        const friendChat: Chat | undefined = this.chats[fromUser.id];

        this.imitateServerMessage("you have been challenged!", fromUser.id);

        friendChat.challenge = ChallengeState.Challenged;
        if (friendChat !== currentChat.value) {
            friendChat.notification = true;
            globalChatNotification.value = true;
        }
    }

    private onChallengeRefused(friendId: FriendId) {
        this.chats[friendId].challenge = ChallengeState.None;

        this.imitateServerMessage("user refused your challenge", friendId);

        if (this.chats[friendId] !== currentChat.value) {
            this.chats[friendId].notification = true;
            globalChatNotification.value = true;
        }
    }

    private onChallengeAccepted(friendId: FriendId) {
        this.chats[friendId].challenge = ChallengeState.None;

        this.imitateServerMessage("user accepted your challenge", friendId);

        if (this.chats[friendId] !== currentChat.value) {
            this.chats[friendId].notification = true;
            globalChatNotification.value = true;
        }

        router.replace({ "name": "game" });
    }

    private onChallengeCanceled(friendId: FriendId) {
        this.imitateServerMessage("challenge has been cancelled...", friendId);
        this.chats[friendId].challenge = ChallengeState.None;
    }

    private imitateServerMessage(message: string, friendId: number) {
        const newMessage: Message = {
            from: { id: -1, username: "server"},
            message: message
        }
        this.chats[friendId].messages.push(newMessage);
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
			unsetCurrentChat();
		else {
			currentChat.value = chat;
			chat.notification = false;
            globalChatNotification.value = false;
		}
	}

    private appendChatToChatMap(friend: ChatUser): void {
        if (!this.chats[friend.id]) {
            const newChat: Chat = {
                target: friend,
                messages: [],
                notification: false,
                challenge: ChallengeState.None
            }
            this.chats[friend.id] = newChat;
        }
        else {
            this.chats[friend.id].challenge = ChallengeState.None;
        }
    }

    private findFriendById(id: number): ChatUser | undefined {
        return this.friends.find((friend) => id === friend.id);
    }

    sendChallenge() {
        if (!currentChat.value)
            return;

        currentChat.value.challenge = ChallengeState.Challenger;

        const toFriendId: FriendId = (<ChatUser>currentChat.value.target).id;
         const payload: MessagePayload = {
            friendId: toFriendId,
            message: 'challenge'
        };
        user.socket?.emit('challenge', payload);
    }

    acceptChallenge() {
        if (!currentChat.value)
            return;

        const friendId: FriendId = (<ChatUser>currentChat.value.target).id;

        const challengePlayers: ChallengePlayers = {
            user1Id: friendId,
            user2Id: user.id,
        }
        user.socket?.emit('accept-challenge', challengePlayers, (acceptedOk: string) => {
            if (acceptedOk) {
                this.chats[friendId].challenge = ChallengeState.None;
                router.replace({ "name": "game" });
            } else {
                this.imitateServerMessage("cannot accept challenge because user is playing. Please wait for their game to end and try again.", friendId);
            }
        });
    }

    refuseChallenge() {
        if (!currentChat.value)
            return;

        const friendId: FriendId = (<ChatUser>currentChat.value.target).id;

        user.socket?.emit('refuse-challenge', friendId);
        currentChat.value.challenge = ChallengeState.None;
    }

    cancelChallenge(friendId: FriendId) {
        user.socket?.emit('cancel-challenge', friendId);
        this.chats[friendId].challenge = ChallengeState.None;
    }
};

export const directMessageController = reactive<DirectMessageController>(new DirectMessageController());