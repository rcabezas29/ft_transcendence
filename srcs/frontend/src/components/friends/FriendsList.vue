<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { type Friend, friendsController, FriendStatus } from '@/friendsController';
import { user } from "../../user";
import type { UserData } from "@/interfaces";

interface Props {
	userId: number
}

const props = withDefaults(defineProps<Props>(), {
	userId: user.id
});

async function getUser(friendId: any) {
  const usersRequest = await fetch(`http://localhost:3000/users/${friendId}`, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  });

  if (usersRequest.status != 200) {
    return null;
  }

  const userData: UserData = await usersRequest.json();
  return userData;
}

function getUserAvatar(friendId: any): string {
  return `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${friendId}`;
}

function isOnline(friend: any): boolean {
  return friend.status === FriendStatus.online;
}

function isGaming(friend: any): boolean {
  return friend.status === FriendStatus.gaming;
}

// function sendFriendRequest() {
//   const userId = 2;

//   friendsController.sendFriendRequest(userId);
// }

const activeFriends = computed(() => {
  return friendsController.getActiveFriends();
});

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
});

</script>

<template>
  <div class="friends-section">
    <div class="title-bar">
      <h2>FRIENDS REQUESTS</h2>
    </div>
    <div class="friends-subsection">
      <div class="request-row" v-for="(friend, index) in receivedFriendRequests" :key="friend.userId">
        <div class="friend-request">
          <div class="row-number-box">{{ index + 1 }}</div>
          <div class="user-img">
            <p>{{ friend.username }}</p>
						<img id="user-image" :src="getUserAvatar(friend.userId)" />
					</div>
        </div>
        <div class="friend-request-buttons">
          <button class="friend-request-bt"
            @click="() => friendsController.acceptFriendRequest(friend.userId)">Accept</button>
          <button class="friend-request-bt"
            @click="() => friendsController.denyFriendRequest(friend.userId)">Deny</button>
        </div>
      </div>
    </div>
    <div class="title-bar">
      <h2>#</h2>
      <h2>username</h2>
      <h2>status</h2>
    </div>
    <div class="friends-subsection">
      <div class="request-row" v-for="(friend, index) in activeFriends" :key="friend.userId">
        <div class="friend-request">
          <div class="row-number-box">{{ index + 1 }}</div>
          <div class="user-img">
            <p>{{ friend.username }}</p>
						<img id="user-image" :src="getUserAvatar(friend.userId)" />
					</div>
          <span v-if="isOnline(friend)">Online</span>
          <span v-else-if="isGaming(friend)">Gaming</span>
          <span v-else>Offline</span>
        </div>
        <div class="friend-status" :class="{ 'friend-status-online': isOnline(friend), 'friend-status-gaming': isGaming(friend) }"></div>
        <button class="friend-request-bt" @click="() => friendsController.blockUser(friend.userId)">Block</button>
        <button class="friend-request-bt" @click="() => friendsController.unfriendUser(friend.userId)">Unfriend</button>
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
  box-sizing: border-box;
  font-size: 0.6rem;
  text-align: center;
  padding: 0.1rem;
  background: #1E9052;
  border: 0.3em solid #4BFE65;
  display: flex;
  justify-content: space-between;
  padding-right: 15%;
}

.request-row {
  display: flex;
}

.friends-subsection {
  width: 100%;
}

.active-friend,
.friend-request {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #08150c;
  border: 0.1em solid #4BFE65;
  box-sizing: border-box;
  margin-bottom: 0;
  margin-right: 0.5em;
}

.friend-request-buttons {
  display: flex;
  gap: 0.5rem;
}

.friend-request-bt {
  padding: 0.5rem;
  box-sizing: border-box;
  align-items: center;
  color: #b3f9d7;
  background: #08150c;
  box-sizing: border-box;
  margin-bottom: 0;
  border: 0.1em solid #4BFE65;
}

.row-number-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-color: #4BFE65;
  color: #08150c;
  font-weight: bold;
  margin-right: 0.5rem;
}

.friend-request-bt:hover {
  background-color: #4BFE65;
  color: #08150c;
}

.user-img {
  display: flex;
  justify-content: space-between;
}
.user-img img {
  width: 40px;
  height: 40px;
}
</style>
