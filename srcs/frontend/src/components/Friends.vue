<script setup lang="ts">
import { friendsController } from '@/friendsController';
friendsController.fetchActiveFriends()
friendsController.fetchBlockedFriends()
friendsController.fetchFriendRequests()
</script>

<template>
	<h1>Friends Component</h1>
    <h2>Active friends</h2>
    <div v-for="friend in friendsController.activeFriends" :key="friend.userId">
        {{ friend.username }} ({{ friend.status }})
    </div>
    <h2>Blocked friends</h2>
    <div v-for="friend in friendsController.blockedFriends" :key="friend.userId">
        {{ friend.username }} ({{ friend.status }})
    </div>
    <h2>Friend requests</h2>
    <div v-for="friend in friendsController.friendRequests" :key="friend.userId">
        {{ friend.username }} ({{ friend.status }})
    </div>

</template>

<style scoped>

</style>
