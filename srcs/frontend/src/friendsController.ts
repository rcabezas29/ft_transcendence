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

class FriendsController {
    public friends: Friend[] = [];

    setEventHandlers() {
        user.socket?.on('connected-friends', (payload: FriendId[]) => {this.onConnectedFriends(payload)});
        user.socket?.on('friend-online', (payload: FriendId) => {this.onFriendConnected(payload)});
        user.socket?.on('friend-offline', (payload: FriendId) => {this.onFriendDisconnected(payload)});
    }

    async onConnectedFriends(payload: FriendId[]) {
        await this.fetchFriends();
        payload.forEach(friendId => this.setFriendOnline(friendId));

        const chatOnlineFriends: ChatUser[] = this.friends
                .filter(friend => {
                    return friend.friendshipStatus === FriendshipStatus.Active
                    && friend.status === FriendStatus.online;
                })
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
        if (this.friends.find(u => u.userId == userId && u.friendshipStatus == FriendshipStatus.Active))
            return true;
        return false;
    }

    userIsPending(userId: number): boolean {
        if (this.friends.find(u => u.userId == userId && u.friendshipStatus == FriendshipStatus.Pending))
            return true;
        return false;
    }

    userIsBlocked(userId: number): boolean {
        if (this.friends.find(u => u.userId == userId && u.friendshipStatus == FriendshipStatus.Blocked))
            return true;
        return false;
    }

    getActiveFriends(): Friend[] {
        return this.friends.filter(friend => friend.friendshipStatus === FriendshipStatus.Active);
    }

    getBlockedFriends(): Friend[] {
        return this.friends.filter(friend => friend.friendshipStatus === FriendshipStatus.Blocked);
    }

    getFriendRequests(): Friend[] {
        return this.friends.filter(friend => friend.friendshipStatus === FriendshipStatus.Pending);
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
            console.log("could not send friend request");
            return;
        }
        const response = await httpResponse.json();

        const newFriend: Friend = {
            userId: userId,
            username: username,
            friendshipId: response.id,
            friendshipStatus: FriendshipStatus.Pending,
            status: FriendStatus.offline, //FIXME: probablemente necesite checkear el status de este usuario xq si no no se actualizara si ya estaba online
        }
        this.friends.push(newFriend);
    }

    async acceptFriendRequest(userId: number) {
        const friend = this.findFriendByFriendId(userId);
        if (!friend)
            return;

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

        if (httpResponse.status != 200)
        {
            console.log("could not send friend request");
            return;
        }

        friend.friendshipStatus = FriendshipStatus.Active;
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

        this.friends = response.map((friendPayload: FriendPayload) => {
            const friend: Friend = { ...friendPayload, status: FriendStatus.offline };
            return friend;
        });
    }

    private setFriendOnline(friendId: FriendId) {
        const friend = this.findFriendByFriendId(friendId);
        if (friend)
            friend.status = FriendStatus.online;
    }

    private setFriendOffline(friendId: FriendId) {
       const friend = this.findFriendByFriendId(friendId);
       if (friend)
            friend.status = FriendStatus.offline;
    }

    private friendIdToChatUser(friendId: FriendId): ChatUser | null {
        const friend = this.findFriendByFriendId(friendId);
        if (friend) {
            return {
                id: friend.userId,
                username: friend.username
            }
        }
        return null;
    }

    private findFriendByFriendId(friendId: FriendId): Friend | undefined {
        return this.friends.find((u) => u.userId === friendId);
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
