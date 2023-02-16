import { reactive } from "vue";
import { directMessageController } from "./directMessageController";
import type { ChatUser } from "./interfaces";
import { user } from './user';

enum FriendshipStatus {
    Pending = 0,
    Active = 1,
    Blocked = 2,
}

export enum FriendStatus {
    offline = 0,
    online = 1,
    gaming = 2
}

type FriendId = number;

interface FriendPayload {
    userId: FriendId;
    username: string;
    friendshipStatus: FriendshipStatus;
}

interface Friend {
    userId: FriendId;
    username: string;
    status: FriendStatus;
}

class FriendsController {
    public activeFriends: Friend[] = [];
    public blockedFriends: Friend[] = [];
    public friendRequests: Friend[] = [];

    setEventHandlers() {
        user.socket?.on('connected-friends', (payload: FriendId[]) => {this.onConnectedFriends(payload)});
        user.socket?.on('friend-online', (payload: FriendId) => {this.onFriendConnected(payload)});
        user.socket?.on('friend-offline', (payload: FriendId) => {this.onFriendDisconnected(payload)});
    }

    async onConnectedFriends(payload: FriendId[]) {
        await this.fetchFriends();
        payload.forEach(friend => this.setFriendOnline(friend));

        const friends: ChatUser[] = this.activeFriends
                .filter(friend => friend.status === FriendStatus.online)
                .map(friend => {
                    return {id: friend.userId, username: friend.username};
                });
        directMessageController.onConnectedFriends(friends);
    }

    onFriendConnected(payload: FriendId) {
        this.setFriendOnline(payload);

        const friend = this.friendIdToChatUser(payload);
        if (friend)
            directMessageController.onFriendConnected(friend);
    }

    onFriendDisconnected(payload: FriendId) {
        this.setFriendOffline(payload);

        const friend = this.friendIdToChatUser(payload);
        if (friend)
            directMessageController.onFriendDisconnected(friend);
    }

    userIsFriend(userId: number): boolean {
        if (this.activeFriends.find(user => user.userId == userId))
            return true;
        return false;
    }

    userIsPending(userId: number): boolean {
        if (this.friendRequests.find(user => user.userId == userId))
            return true;
        return false;
    }

    async sendFriendRequest(userId: number) {
        const friendRequestBody = { 
            user1Id: user.id,
            user2Id: userId,
            status: FriendshipStatus.Pending
        };

        console.log(friendRequestBody)

        const httpResponse = await fetch(`http://localhost:3000/friends`, {
            method: "POST",
            headers: {
				"Authorization": `Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(friendRequestBody)
        });

        if (httpResponse.status != 200)
            console.log("could not send friend request");

        const response = await httpResponse.json();
        console.log("POST RESPONSE", response, "STATUS: ", httpResponse.status)
    }

    private async fetchFriends() {
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

    private setFriendOnline(friendId: FriendId) {
        const friend = this.activeFriends.find((u) => u.userId === friendId);
        if (friend)
            friend.status = FriendStatus.online;
    }

    private setFriendOffline(friendId: FriendId) {
        const friend = this.activeFriends.find((u) => u.userId === friendId);
        if (friend)
            friend.status = FriendStatus.offline;
    }

    private friendPayloadToFriend(friendPayload: FriendPayload): Friend {
        return {
            userId: friendPayload.userId,
            username: friendPayload.username,
            status: FriendStatus.offline
        };
    }

    private friendIdToChatUser(friendId: FriendId): ChatUser | null {
        const friend = this.activeFriends.find(friend => friend.userId === friendId);
        if (friend) {
            return {
                id: friend.userId,
                username: friend.username
            }
        }
        return null;
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
