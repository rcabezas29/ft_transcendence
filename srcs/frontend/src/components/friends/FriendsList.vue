<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type Friend, friendsController, FriendStatus } from '@/friendsController';

function isOnline(friend: any): boolean {
    return friend.status === FriendStatus.online;
}

function isGaming(friend: any): boolean {
    return friend.status === FriendStatus.gaming;
}

const activeFriends = computed(() => {
    return friendsController.getActiveFriends();
})

const blockedFriends = ref<Friend[]>([]);
const sentFriendRequests = ref<Friend[]>([]);
const receivedFriendRequests = ref<Friend[]>([]);

friendsController.getBlockedFriends().then((value) => {
    blockedFriends.value = value;
});
friendsController.getSentFriendRequests().then((value) => {
    sentFriendRequests.value = value;
});
friendsController.getReceivedFriendRequests().then((value) => {
    receivedFriendRequests.value = value;
});

watch(friendsController, () => {
    friendsController.getBlockedFriends().then((value) => {
        blockedFriends.value = value;
    });
    friendsController.getSentFriendRequests().then((value) => {
        sentFriendRequests.value = value;
    });
    friendsController.getReceivedFriendRequests().then((value) => {
        receivedFriendRequests.value = value;
    });
})

</script>

<template>
    <div class="friends-section">
        <div class="title-bar">
            <h2>FRIENDS REQUESTS</h2>
        </div>
        <div class="friends-subsection">
            <div class="friend-request" v-for="friend in receivedFriendRequests" :key="friend.userId">
                <span>{{ friend.username }}</span>
                <button @click="() => friendsController.acceptFriendRequest(friend.userId)">Accept</button>
                <button @click="() => friendsController.denyFriendRequest(friend.userId)">Deny</button>
            </div>
        </div>
        <div class="title-bar">
            <h2># user status</h2>
        </div>
        <div class="friends-subsection">
            <div class="active-friend" v-for="friend in activeFriends" :key="friend.userId">
                <span>{{ friend.username }} ({{ friend.status }})</span>
                <div class="friend-status"
                    :class="{ 'friend-status-online': isOnline(friend), 'friend-status-gaming': isGaming(friend) }"></div>
                <button @click="() => friendsController.blockUser(friend.userId)">Block</button>
                <button @click="() => friendsController.unfriendUser(friend.userId)">Unfriend</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.friends-section {
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.title-bar {
    /* width: 100%;
        background-color: #1E9052;
        border-color: #4BFE65;
        color: white;
        padding: 0.5rem;
        text-align: center;
        font-size: 1.25rem; */
    box-sizing: border-box;
    font-size: 0.6rem;
    text-align: center;
    padding: 0.1rem;
    background: #1E9052;
    border: 0.3em solid #4BFE65;
}

.friends-subsection {
    width: 100%;
}

.active-friend,
.friend-request {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.5rem;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    box-sizing: border-box;
    margin-bottom: 0
}
</style>