import { reactive } from "vue";
import type { ChatUser } from "./interfaces";
import { user } from './user';

enum FriendStatus {
    offline = 0,
    online = 1,
    gaming = 2
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
        await friendsController.fetchActiveFriends();
        await friendsController.fetchBlockedFriends();
        await friendsController.fetchFriendRequests();
        payload.forEach(friend => this.setFriendOnline(friend.id));
    }

    onFriendConnected(payload: ChatUser) {
        this.setFriendOnline(payload.id);
    }

    onFriendDisconnected(payload: ChatUser) {
        this.setFriendOffline(payload.id);
    }

    async fetchActiveFriends() {
        const httpResponse = await fetch(`http://localhost:3000/users/${user.id}/active-friends`, {
            method: "GET",
            headers: {
				"Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200)
            console.log("error fetching friends");

        const response = await httpResponse.json();
        this.activeFriends = response.map((friend: any): Friend => {
            return {
                userId: friend.id,
                username: friend.username,
                status: FriendStatus.offline
        }})
    }

    async fetchBlockedFriends() {
        const httpResponse = await fetch(`http://localhost:3000/users/${user.id}/blocked-friends`, {
            method: "GET",
            headers: {
				"Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200)
            console.log("error fetching friends");

        const response = await httpResponse.json();
        this.blockedFriends = response.map((friend: any): Friend => {
            return {
                userId: friend.id,
                username: friend.username,
                status: FriendStatus.offline
        }})
    }

    async fetchFriendRequests() {
        const httpResponse = await fetch(`http://localhost:3000/users/${user.id}/friend-requests`, {
            method: "GET",
            headers: {
				"Authorization": `Bearer ${user.token}`
            }
        });
        if (httpResponse.status != 200)
            console.log("error fetching friends");

        const response = await httpResponse.json();
        this.friendRequests = response.map((friend: any): Friend => {
            return {
                userId: friend.id,
                username: friend.username,
                status: FriendStatus.offline
        }})
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
