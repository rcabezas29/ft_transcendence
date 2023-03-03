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

enum BlockDirection {
    Blocker = 0,
    Blocked = 1
}

type FriendId = number;

interface FriendPayload {
    userId: FriendId;
    username: string;
    friendshipId: number;
    friendshipStatus: FriendshipStatus;
}

interface FriendshipStatusPayload {
    status: FriendshipStatus;
    friendId: number;
}

export interface Friend {
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
        user.socket?.on('friend-in-a-game', (payload: FriendId) => {this.onFriendInAGame(payload)});
        user.socket?.on('new-friendship', (payload: FriendPayload) => {this.onNewFriendship(payload)});
        user.socket?.on('friendship-status-change', (payload: FriendshipStatusPayload) => {this.onFriendshipStatusChange(payload)});
        user.socket?.on('friendship-deleted', (payload: FriendId) => {this.onFriendshipDeleted(payload)});

        user.addOnLogoutCallback(() => this.onLogout());
    }

    onLogout() {
        this.friends = {};
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

        if (!this.userIsActiveFriend(payload))
            return;

        const friend = this.friendIdToChatUser(payload);
        if (friend)
            directMessageController.onFriendConnected(friend);
    }

    onFriendDisconnected(payload: FriendId) {
        this.setFriendOffline(payload);
        directMessageController.onFriendDisconnected(payload);
    }

    onFriendInAGame(payload: FriendId) {
        this.setFriendInAGame(payload);
    }

    onNewFriendship(payload: FriendPayload) {
        const newFriend: Friend = { ...payload, status: FriendStatus.offline };
        this.friends[payload.userId] = newFriend;
    }

    onFriendshipStatusChange(payload: FriendshipStatusPayload) {
        const friend = this.friends[payload.friendId];
        if (!friend)
            return;
        friend.friendshipStatus = payload.status;

        if (this.userIsActiveFriend(friend.userId)) {
            const chatUser = this.friendIdToChatUser(friend.userId);
            if (chatUser)
                directMessageController.onFriendConnected(chatUser);
        }
        else
            directMessageController.onFriendDisconnected(friend.userId);
    }

    onFriendshipDeleted(payload: FriendId) {
        directMessageController.onFriendDisconnected(payload);

        const friend = this.friends[payload];
        if (!friend)
            return;
        delete this.friends[payload];
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

    /* gets only the friends this user has blocked, but excludes the ones who have blocked the user */
    async getBlockedFriends(): Promise<Friend[]> {
        const allBlockedFriends: Friend[] = this.getFriendsByFriendshipStatus(FriendshipStatus.Blocked);
        const myBlockedFriends: Friend[] = [];
        for (let friend of allBlockedFriends) {
            const direction = await this.checkBlockDirection(friend.friendshipId);
            if (direction === BlockDirection.Blocker)
                myBlockedFriends.push(friend);
        }
        return myBlockedFriends;
    }

    async getSentFriendRequests(): Promise<Friend[]> {
        const pendingReqs: Friend[] = this.getFriendsByFriendshipStatus(FriendshipStatus.Pending);
        const sentFriendReqs: Friend[] = [];
        for (let friend of pendingReqs) {
            const direction = await this.checkFriendRequestDirection(friend.friendshipId);
            if (direction === FriendRequestDirection.Sender)
                sentFriendReqs.push(friend);
        }
        return sentFriendReqs;
    }

    async getReceivedFriendRequests(): Promise<Friend[]> {
        const pendingReqs: Friend[] = this.getFriendsByFriendshipStatus(FriendshipStatus.Pending);
        const receivedFriendReqs: Friend[] = [];
        for (let friend of pendingReqs) {
            const direction = await this.checkFriendRequestDirection(friend.friendshipId);
            if (direction === FriendRequestDirection.Receiver)
                receivedFriendReqs.push(friend);
        }
        return receivedFriendReqs;
    }

    async sendFriendRequest(userId: number) {
        if (!userId)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friendships`, {
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

        if (httpResponse.status != 201) {
            console.log("error while sending friend request");
            return;
        }
    }

    async acceptFriendRequest(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friendships/${friend.friendshipId}/accept-request`, {
            method: "PATCH",
            headers: {
				"Authorization": `Bearer ${user.token}`,
            }
        });

        if (httpResponse.status != 200) {
            console.log("error while accepting friend request");
            return;
        }
    }

    async denyFriendRequest(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;

        const httpResponse = await fetch(`http://localhost:3000/friendships/${friend.friendshipId}/deny-request`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            }
        });

        if (httpResponse.status != 200) {
            console.log("error while denying friend request");
            return;
        }
    }

    async unfriendUser(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
             return;

        const httpResponse = await fetch(`http://localhost:3000/friendships/${friend.friendshipId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });

        if (httpResponse.status != 200) {
            console.log("error while unfriending user");
            return;
        }
    }

    async blockUser(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;
    
        const httpResponse = await fetch(`http://localhost:3000/friendships/${friend.friendshipId}/block`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });

        if (httpResponse.status != 200) {
            console.log("error while blocking user");
            return;
        }
    }

    async unblockUser(userId: number) {
        const friend = this.friends[userId];
        if (!friend)
            return;
    
        const httpResponse = await fetch(`http://localhost:3000/friendships/${friend.friendshipId}/unblock`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${user.token}`,
            },
        });

        if (httpResponse.status != 200) {
            console.log("error while unblocking user");
            return;
        }
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

    private setFriendInAGame(friendId: FriendId) {
        const friend = this.friends[friendId];
        if (!friend)
            return;
        friend.status = FriendStatus.gaming;
    }

    private async checkFriendRequestDirection(friendshipId: number): Promise<FriendRequestDirection | null> {
        const httpResponse = await fetch(`http://localhost:3000/friendships/${friendshipId}/request-direction`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200) {
            console.log("error getting friend request direction");
            return null;
        }
        const response: FriendRequestDirection = await httpResponse.json();
        return response;
    }

    private async checkBlockDirection(friendshipId: number): Promise<BlockDirection | null> {
        const httpResponse = await fetch(`http://localhost:3000/friendships/${friendshipId}/block-direction`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200) {
            console.log("error getting block direction");
            return null;
        }
        const response: BlockDirection = await httpResponse.json();
        return response;
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
