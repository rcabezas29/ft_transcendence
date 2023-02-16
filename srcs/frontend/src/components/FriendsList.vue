<script setup lang="ts">

import { friendsController, FriendStatus } from '@/friendsController';

function isOnline(friend: any): boolean {
    return friend.status === FriendStatus.online;
}

function isGaming(friend: any): boolean {
    return friend.status === FriendStatus.gaming;
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
