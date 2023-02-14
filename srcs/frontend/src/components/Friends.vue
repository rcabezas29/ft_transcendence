<script setup lang="ts">
import { friendsController } from '@/friendsController';
import { onBeforeMount } from 'vue';

onBeforeMount(async () => {
    //await friendsController.fetchActiveFriends()
    //await friendsController.fetchBlockedFriends()
    //await friendsController.fetchFriendRequests()
})

</script>

<template>
	<h1>Friends Component</h1>
    <div class="all-friends">
        <div class="friends-subsection">
            <h2>Active friends</h2>
            <div v-for="friend in friendsController.activeFriends" :key="friend.userId">
                <span>{{ friend.username }} ({{ friend.status }})</span>
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
    </div>
</template>

<style scoped>
    .all-friends {
        display: flex;
        justify-content: space-around;
    }
</style>
