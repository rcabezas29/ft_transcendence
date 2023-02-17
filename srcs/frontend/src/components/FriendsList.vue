<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
    {
        console.log("error fetching friends");
        return [];
    }

    const response = await httpResponse.json();

    return response.map((u: any) => {
        return {id: u.id, username: u.username};
    });
}

function filteredList() {
    if (input.value.length > 0) {
        return users.value.filter((u) =>
            u.username.toLowerCase().includes(input.value.toLowerCase())
        );
    }
    return [];
}

function userIsFriendable(userId: number): boolean {
    return (userId != user.id && !friendsController.userIsActiveFriend(userId) && !friendsController.userIsPending(userId))
}

onMounted(async () => {
    users.value = await fetchUsers();
})

const activeFriends = computed(() => {
    return friendsController.getActiveFriends();
})

const blockedFriends = computed(() => {
    return friendsController.getBlockedFriends();
})

const friendRequests = computed(() => {
    return friendsController.getFriendRequests();
})

</script>

<template>
	<h1>Friends Component</h1>
    <div class="friends-section">
        <div class="friends-subsection">
            <h2>Active friends</h2>
            <div class="active-friend" v-for="friend in activeFriends" :key="friend.userId">
                <span>{{ friend.username }} ({{ friend.status }})</span>
				<div class="friend-status" :class="{'friend-status-online': isOnline(friend), 'friend-status-gaming': isGaming(friend) }"></div>
                <button>Block</button>
            </div>
        </div>
        <div class="friends-subsection">
            <h2>Blocked friends</h2>
            <div v-for="friend in blockedFriends" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button>Unblock</button>
            </div>
        </div>
        <div class="friends-subsection">
            <h2>Friend requests</h2>
            <div v-for="friend in friendRequests" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button>Accept</button>
                <button>Deny</button>
            </div>
        </div>
        <div class="users-search">
            <h2>Find your people</h2>
            <input type="text" v-model="input" placeholder="Search users..." />
            <div class="user-item" v-for="u in filteredList()" :key="u.id">
                <span>{{ u.username }}</span>
                <button @click="() => friendsController.sendFriendRequest(u.id, u.username)" v-if="userIsFriendable(u.id)">Send friend request</button>
            </div>
            <div class="item-error" v-if="input && filteredList().length === 0">
                <p>No users found!</p>
            </div>
        </div>
    </div>
    
</template>

<style scoped>
    .friends-section {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
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
