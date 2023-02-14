import { reactive } from "vue";
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
        this.activeFriends = response.map((friend): Friend => {
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
        this.blockedFriends = response.map((friend): Friend => {
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
        this.friendRequests = response.map((friend): Friend => {
            return {
                userId: friend.id,
                username: friend.username,
                status: FriendStatus.offline
        }})
    }
};

export const friendsController = reactive<FriendsController>(new FriendsController());
