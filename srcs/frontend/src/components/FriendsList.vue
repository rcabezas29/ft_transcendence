<script setup lang="ts">
import { onMounted, ref } from "vue";
import { friendsController, FriendStatus } from '@/friendsController';
import { user } from "@/user";

interface UserInfo {
    id: number,
    username: string
}

const input = ref<string>("");
const users = ref<UserInfo[]>([]);

function isOnline(friend: any): boolean {
    return friend.status === FriendStatus.online;
}

function isGaming(friend: any): boolean {
    return friend.status === FriendStatus.gaming;
}

async function fetchUsers(): Promise<UserInfo[]> {
    const httpResponse = await fetch(`http://localhost:3000/users`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    if (httpResponse.status != 200)
        console.log("error fetching friends");

    const response = await httpResponse.json();

    return response.map((u: any) => {
        return {id: u.id, username: u.username};
    });
}

function filteredList() {
    if (input.value.length > 0) {
        return users.value.filter((user) =>
            user.username.toLowerCase().includes(input.value.toLowerCase())
        );
    }
    return [];
}

onMounted(async () => {
    users.value = await fetchUsers();
})

function sendFriendRequest(userId: number) {
    friendsController.sendFriendRequest(userId);
}

</script>

<template>
	<h1>Friends Component</h1>
    <div class="all-friends">
        <div class="friends-subsection">
            <h2>Active friends</h2>
            <div class="active-friend" v-for="friend in friendsController.activeFriends" :key="friend.userId">
                <span>{{ friend.username }} ({{ friend.status }})</span>
				<div class="friend-status" :class="{'friend-status-online': isOnline(friend), 'friend-status-gaming': isGaming(friend) }"></div>
                <button>Block</button>
            </div>
        </div>
        <div class="friends-subsection">
            <h2>Blocked friends</h2>
            <div v-for="friend in friendsController.blockedFriends" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button>Unblock</button>
            </div>
        </div>
        <div class="friends-subsection">
            <h2>Friend requests</h2>
            <div v-for="friend in friendsController.friendRequests" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button>Accept</button>
                <button>Deny</button>
            </div>
        </div>
        <div class="users-search">
            <h2>Find your people</h2>
            <input type="text" v-model="input" placeholder="Search users..." />
            <div class="user-item" v-for="user in filteredList()" :key="user.id">
                <span>{{ user.username }}</span>
                <button @click="() => sendFriendRequest(user.id)" v-if="!friendsController.userIsFriend(user.id) && !friendsController.userIsPending(user.id)">Send friend request</button>
            </div>
            <div class="item-error" v-if="input && filteredList().length === 0">
                <p>No users found!</p>
            </div>
        </div>
    </div>
    
</template>

<style scoped>
    .all-friends {
        display: flex;
        justify-content: space-around;
    }

    .active-friend {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .friend-status {
        height:10px;
        width: 10px;
    }

    .friend-status-online {
        background-color: #07d807;
    }

    .friend-status-gaming {
        background-color: #8807d8;
    }
</style>
