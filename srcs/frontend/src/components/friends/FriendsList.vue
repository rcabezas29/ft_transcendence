<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type Friend, friendsController, FriendStatus } from '@/friendsController';
import FriendSearchBar from "./FriendSearchBar.vue";

function isOnline(friend: any): boolean {
    return friend.status === FriendStatus.online;
}

function isGaming(friend: any): boolean {
    return friend.status === FriendStatus.gaming;
}

const activeFriends = computed(() => {
    return friendsController.getActiveFriends();
})

const blockedFriends = computed(() => {
    return friendsController.getBlockedFriends();
})

const sentFriendRequests = ref<Friend[]>([]);
const receivedFriendRequests = ref<Friend[]>([]);
friendsController.getSentFriendRequests().then((value) => {
    sentFriendRequests.value = value;
});
friendsController.getReceivedFriendRequests().then((value) => {
    receivedFriendRequests.value = value;
});

watch(friendsController, () => {
    friendsController.getSentFriendRequests().then((value) => {
        sentFriendRequests.value = value;
    });
    friendsController.getReceivedFriendRequests().then((value) => {
        receivedFriendRequests.value = value;
    });
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
                <button @click="() => friendsController.unfriendUser(friend.userId)">Unfriend</button>
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
            <h3>Sent requests</h3>
            <div v-for="friend in sentFriendRequests" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button @click="() => friendsController.unfriendUser(friend.userId)">Cancel</button>
            </div>
            <h3>Received requests</h3>
            <div v-for="friend in receivedFriendRequests" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button @click="() => friendsController.acceptFriendRequest(friend.userId)">Accept</button>
                <button @click="() => friendsController.denyFriendRequest(friend.userId)">Deny</button>
            </div>
        </div>
        <FriendSearchBar/>
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
