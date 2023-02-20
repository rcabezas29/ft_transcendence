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

enum FriendRequestDirection {
    Sender = 0,
    Receiver = 1
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
        return friend.friendshipStatus === FriendshipStatus.Pending;
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

    getFriendRequests(): Friend[] {
        return this.getFriendsByFriendshipStatus(FriendshipStatus.Pending);
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
                status: FriendshipStatus.Pending
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
            friendshipStatus: FriendshipStatus.Pending,
            status: FriendStatus.offline,
        }
        this.friends[userId] = newFriend;
    }

    async acceptFriendRequest(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;

        const friendReqDirection: FriendRequestDirection | null = await this.checkFriendRequestDirection(friend.friendshipId);
        if (friendReqDirection === null) {
            console.log("error while determining friend request direction")
            return;
        }
        if (friendReqDirection === FriendRequestDirection.Sender) {
            console.log("cannot accept your own friend request")
            return;
        }

        const httpResponse = await fetch(`http://localhost:3000/friends/${friend.friendshipId}`, {
            method: "PATCH",
            headers: {
				"Authorization": `Bearer ${user.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: FriendshipStatus.Active
            })
        });

        if (httpResponse.status != 200) {
            console.log("error while accepting friend request");
            return;
        }

        friend.friendshipStatus = FriendshipStatus.Active;
    }

    async denyFriendRequest(userId: number) {
        const deleted = await this.deleteFriend(userId);
        if (!deleted)
            console.log("error while denying friend request");
    }

    async unfriendUser(userId: number) {
        const deleted = await this.deleteFriend(userId);
        if (!deleted)
            console.log("error while unfriending user");
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

    private async deleteFriend(friendId: FriendId): Promise<boolean> {
        const friend = this.friends[friendId];
        if (!friend)
             return false;

        const httpResponse = await fetch(`http://localhost:3000/friends/${friend.friendshipId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });

        if (httpResponse.status != 200)
            return false;

        delete this.friends[friendId];
        return true;
    }

    private async checkFriendRequestDirection(friendshipId: number): Promise<FriendRequestDirection | null> {
        const httpResponse = await fetch(`http://localhost:3000/friends/${friendshipId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });
        if (httpResponse.status != 200)
            return null;

        const response = await httpResponse.json();
        if (response.user1Id === user.id)
            return FriendRequestDirection.Sender;
        else if (response.user2Id === user.id)
            return FriendRequestDirection.Receiver;
        
        return null;
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
