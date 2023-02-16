import { reactive } from "vue";
import type { ChatUser } from "./interfaces";
import { user } from './user';

enum FriendshipStatus {
    Pending = 0,
    Active = 1,
    Blocked = 2,
}

enum FriendStatus {
    offline = 0,
    online = 1,
    gaming = 2
}

interface FriendPayload {
    userId: number;
    username: string;
    friendshipStatus: FriendshipStatus;
}

interface Friend {
    //friendshipId: number;
    userId: number;
    username: string;
    status: FriendStatus;
}

class FriendsController {
    public activeFriends: Friend[] = [];
    public blockedFriends: Friend[] = [];
    public friendRequests: Friend[] = [];

    setEventHandlers() {
        user.socket?.on('connected-friends', (payload: ChatUser[]) => {this.onConnectedFriends(payload)});
        user.socket?.on('friend-online', (payload: ChatUser) => {this.onFriendConnected(payload)});
        user.socket?.on('friend-offline', (payload: ChatUser) => {this.onFriendDisconnected(payload)});
    }

    private setFriendOnline(friendId: number) {
        const friend = this.activeFriends.find((u) => u.userId === friendId);
        if (friend)
            friend.status = FriendStatus.online;
    }

    private setFriendOffline(friendId: number) {
        const friend = this.activeFriends.find((u) => u.userId === friendId);
        if (friend)
            friend.status = FriendStatus.offline;
    }

    async onConnectedFriends(payload: ChatUser[]) {
        await friendsController.fetchFriends();
        payload.forEach(friend => this.setFriendOnline(friend.id));
    }

    onFriendConnected(payload: ChatUser) {
        this.setFriendOnline(payload.id);
    }

    onFriendDisconnected(payload: ChatUser) {
        this.setFriendOffline(payload.id);
    }

    async fetchFriends() {
        const httpResponse = await fetch(`http://localhost:3000/users/${user.id}/friends`, {
            method: "GET",
            headers: {
				"Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200)
            console.log("error fetching friends");

        const response = await httpResponse.json();

        this.activeFriends = response
                .filter((friend: FriendPayload) => friend.friendshipStatus === FriendshipStatus.Active)
                .map((friend: FriendPayload) => this.friendPayloadToFriend(friend));

        this.blockedFriends = response
                .filter((friend: FriendPayload) => friend.friendshipStatus === FriendshipStatus.Blocked)
                .map((friend: FriendPayload) => this.friendPayloadToFriend(friend));

        this.friendRequests = response
                .filter((friend: FriendPayload) => friend.friendshipStatus === FriendshipStatus.Pending)
                .map((friend: FriendPayload) => this.friendPayloadToFriend(friend));
    }

    private friendPayloadToFriend(friendPayload: FriendPayload): Friend {
        return {
            userId: friendPayload.userId,
            username: friendPayload.username,
            status: FriendStatus.offline
        };
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
