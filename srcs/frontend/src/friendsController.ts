import { reactive } from "vue";
import { directMessageController } from "./directMessageController";
import type { ChatUser } from "./interfaces";
import { user } from './user';

enum FriendshipStatus {
    RequestSent = 0,
    RequestReceived = 1,
    Active = 2,
    Blocked = 3,
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
    friendshipId: number;
    friendshipStatus: FriendshipStatus;
}

interface Friend {
    userId: FriendId;
    username: string;
    friendshipId: number;
    friendshipStatus: FriendshipStatus;
    status: FriendStatus;
}

type FriendMap = {
    [id: FriendId]: Friend;
}

class FriendsController {
    public friends: FriendMap = {};

    setEventHandlers() {
        user.socket?.on('connected-friends', (payload: FriendId[]) => {this.onConnectedFriends(payload)});
        user.socket?.on('friend-online', (payload: FriendId) => {this.onFriendConnected(payload)});
        user.socket?.on('friend-offline', (payload: FriendId) => {this.onFriendDisconnected(payload)});
    }

    async onConnectedFriends(payload: FriendId[]) {
        await this.fetchFriends();
        payload.forEach(friendId => this.setFriendOnline(friendId));

        const activeFriends = this.getActiveFriends();
        const chatOnlineFriends: ChatUser[] = activeFriends
                .filter(friend => friend.status === FriendStatus.online)
                .map(friend => {
                    return {id: friend.userId, username: friend.username};
                });
        directMessageController.onConnectedFriends(chatOnlineFriends);
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

    userIsActiveFriend(userId: number): boolean {
        const friend = this.friends[userId];
        if (!friend)
            return false;
        return friend.friendshipStatus === FriendshipStatus.Active;
    }

    userIsPending(userId: number): boolean {
        const friend = this.friends[userId];
        if (!friend)
            return false;
        return (friend.friendshipStatus === FriendshipStatus.RequestReceived
                || friend.friendshipStatus === FriendshipStatus.RequestSent);
    }

    userIsBlocked(userId: number): boolean {
        const friend = this.friends[userId];
        if (!friend)
            return false;
        return friend.friendshipStatus === FriendshipStatus.Blocked;
    }

    getFriendsByFriendshipStatus(friendshipStatus: FriendshipStatus): Friend[] {
        const friends: Friend[] = [];
        for (let friend in this.friends) {
            if (this.friends[friend].friendshipStatus === friendshipStatus)
                friends.push(this.friends[friend]);
        }
        return friends;
    }

    getActiveFriends(): Friend[] {
        return this.getFriendsByFriendshipStatus(FriendshipStatus.Active);
    }

    getBlockedFriends(): Friend[] {
        return this.getFriendsByFriendshipStatus(FriendshipStatus.Blocked);
    }

    getSentFriendRequests(): Friend[] {
        return this.getFriendsByFriendshipStatus(FriendshipStatus.RequestSent);
    }

    getReceivedFriendRequests(): Friend[] {
        return this.getFriendsByFriendshipStatus(FriendshipStatus.RequestReceived);
    }

    async sendFriendRequest(userId: number, username: string) {
        if (!userId || !username)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friends`, {
            method: "POST",
            headers: {
				"Authorization": `Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user1Id: user.id,
                user2Id: userId,
            })
        });

        if (httpResponse.status != 201)
        {
            console.log("error while sending friend request");
            return;
        }
        const response = await httpResponse.json();

        const newFriend: Friend = {
            userId: userId,
            username: username,
            friendshipId: response.id,
            friendshipStatus: FriendshipStatus.RequestSent,
            status: FriendStatus.offline,
        }
        this.friends[userId] = newFriend;
    }

    async acceptFriendRequest(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friends/${friend.friendshipId}/accept-request`, {
            method: "PATCH",
            headers: {
				"Authorization": `Bearer ${user.token}`,
            }
        });

        if (httpResponse.status != 200) {
            console.log("error while accepting friend request");
            return;
        }

        friend.friendshipStatus = FriendshipStatus.Active;
    }

    async denyFriendRequest(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friends/${friend.friendshipId}/deny-request`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            }
        });

        if (httpResponse.status != 200) {
            console.log("error while denying friend request");
            return;
        }

        delete this.friends[userId];
    }

    async unfriendUser(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
             return;

        const httpResponse = await fetch(`http://localhost:3000/friends/${friend.friendshipId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });

        if (httpResponse.status != 200) {
            console.log("error while unfriending user");
            return;
        }

        delete this.friends[userId];
    }

    private async fetchFriends() {
        const httpResponse = await fetch(`http://localhost:3000/users/${user.id}/friends`, {
            method: "GET",
            headers: {
				"Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200)
        {
            console.log("error fetching friends");
            return;
        }

        const response = await httpResponse.json();

        const friends: Friend[] = response.map((friendPayload: FriendPayload) => {
            const friend: Friend = { ...friendPayload, status: FriendStatus.offline };
            return friend;
        });

        friends.forEach((friend) => {
            this.friends[friend.userId] = friend;
        });
    }

    private setFriendOnline(friendId: FriendId) {
        const friend = this.friends[friendId];
        if (!friend)
            return;
        friend.status = FriendStatus.online;
    }

    private setFriendOffline(friendId: FriendId) {
        const friend = this.friends[friendId];
        if (!friend)
            return;
        friend.status = FriendStatus.offline;
    }

    private friendIdToChatUser(friendId: FriendId): ChatUser | null {
        const friend = this.friends[friendId];
        if (!friend)
            return null;
        return {
            id: this.friends[friendId].userId,
            username: this.friends[friendId].username
        }
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
