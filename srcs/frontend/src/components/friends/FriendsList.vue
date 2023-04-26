<script setup lang="ts">
import Table from "../ui/Table.vue";
import Button from "../ui/Button.vue";
import CrossIcon from "../icons/CrossIcon.vue";
import { computed, ref, watch } from "vue";
import { type Friend, friendsController, FriendStatus } from '@/friendsController';

function getUserAvatar(friendId: any): string {
    return `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${friendId}`;
}

function isOnline(friend: Friend): boolean {
    return friend.status === FriendStatus.online;
}

function isGaming(friend: Friend): boolean {
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

const selectedUser = ref<Friend | null>(null);
function selectUser(friend: Friend): void {
	selectedUser.value = friend;
}

function unselectUser():void {
	selectedUser.value = null;
}

function isUserSelected(user: Friend): boolean {
	return user === selectedUser.value;
}

function viewProfile() {
	//TODO: redirect to user profile
	console.log('REDIRECT TO USER PROFILE!!!')
}
    
</script>

<template>
    <Table class="friends-table">
        <template #head>
			<tr>
				<th class="user-column">friend requests</th>
			</tr>
		</template>
		<template #body>
			<tr class="table-row" v-for="friend in receivedFriendRequests" :key="friend.userId" @click="selectUser(friend)" @mouseenter="selectUser(friend)" @mouseleave="unselectUser">
				<td v-show="!isUserSelected(friend)">
					<div class="table-user">
						<span class="table-user-img">
							<img :src="getUserAvatar(friend.userId)" />
						</span>
						<span class="table-username">
							<div class="truncate">
								{{ friend.username }}
							</div>
						</span>
					</div>
				</td>
				<td class="hovering-row" v-show="isUserSelected(friend)">
					<div class="option-buttons">
						<Button class="row-button" :selected="true" @click="() => friendsController.acceptFriendRequest(friend.userId)">
							ACCEPT
						</Button>
						<Button class="row-button" :selected="true" @click="() => friendsController.denyFriendRequest(friend.userId)">
							DENY
						</Button>
						<Button class="row-button cross-button desktop-hidden" :selected="true" @click.stop="unselectUser">
							<CrossIcon/>
						</Button>
					</div>
				</td>
			</tr>
		</template>
    </Table>

    <Table class="friends-table">
        <template #head>
			<tr>
				<th class="user-column">user</th>
				<th>status</th>
			</tr>
		</template>
		<template #body>
			<tr class="table-row" v-for="friend in activeFriends" :key="friend.userId" @click="selectUser(friend)" @mouseenter="selectUser(friend)" @mouseleave="unselectUser">
				<td v-show="!isUserSelected(friend)">
					<div class="table-user">
						<span class="table-user-img">
							<img :src="getUserAvatar(friend.userId)" />
						</span>
						<span class="table-username">
							<div class="truncate">
								{{ friend.username }}
							</div>
						</span>
					</div>
				</td>
				<td v-show="!isUserSelected(friend)">
					<span v-if="isOnline(friend)">online</span>
                    <span v-else-if="isGaming(friend)">gaming</span>
                    <span v-else>offline</span>
				</td>
				<td class="hovering-row" v-show="isUserSelected(friend)" colspan="2">
					<div class="option-buttons">
						<Button class="row-button" :selected="true" @click="viewProfile">
							VIEW
						</Button>
						<Button class="row-button" :selected="true" @click="() => friendsController.blockUser(friend.userId)">
							BLOCK
						</Button>
						<Button class="row-button" :selected="true" @click="() => friendsController.unfriendUser(friend.userId)">
							UNFRIEND
						</Button>
						<Button class="row-button cross-button desktop-hidden" :selected="true" @click.stop="unselectUser">
							<CrossIcon/>
						</Button>
					</div>
				</td>
			</tr>

            <tr class="table-row blocked-section-row" v-for="friend in blockedFriends" :key="friend.userId" @click="selectUser(friend)" @mouseenter="selectUser(friend)" @mouseleave="unselectUser">
				<td v-show="!isUserSelected(friend)">
					<div class="table-user">
						<span class="table-user-img">
							<img :src="getUserAvatar(friend.userId)" />
						</span>
						<span class="table-username">
							<div class="truncate">
								{{ friend.username }}
							</div>
						</span>
					</div>
				</td>
				<td v-show="!isUserSelected(friend)">
					BLOCKED
				</td>
				<td class="hovering-row" v-show="isUserSelected(friend)" colspan="2">
					<div class="option-buttons">
						<Button class="row-button" :selected="true" @click="viewProfile">
							VIEW
						</Button>
						<Button class="row-button" :selected="true" @click="() => friendsController.unblockUser(friend.userId)">
							UNBLOCK
						</Button>
						<Button class="row-button" :selected="true" @click="() => friendsController.unfriendUser(friend.userId)">
							UNFRIEND
						</Button>
						<Button class="row-button cross-button desktop-hidden" :selected="true" @click.stop="unselectUser">
							<CrossIcon/>
						</Button>
					</div>
				</td>
			</tr>
		</template>
    </Table>
</template>

<style scoped>
.friends-table {
    width: 100%;
    table-layout: fixed;
}

th {
    width: 2%;
}

.user-column {
    width: 10%;
}

.table-row {
	height: 50px;
	cursor: default;
	box-sizing: border-box;
}

.blocked-section-row {
	background-color: #474747;
}

.table-row:hover {
	background-color: #08150C;
}

.hovering-row {
	height: 100%;
	box-sizing: border-box;
	padding: 2px;
}

.option-buttons {
	height: 100%;
	display: flex;
	flex-direction: row;
	gap: 2px;
	box-sizing: border-box;
}

.row-button {
	box-sizing: border-box;
	padding: 9px 12px;
	border-width: 1px;
	flex: 1;
}

.cross-button {
	flex: 0.25;
}

.table-user {
    display: flex;
    align-items: center;
	margin-left: 10px;
}

.table-user-img {
    display: flex;
}

.table-user-img img {
    width: 36px;
    height: 36px;
}

.table-username {
    margin-left: 12px;
    display: table;
    table-layout: fixed;
    width: 100%;
}

.truncate {
    display: table-cell;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

/* Everything bigger than 850px */
@media only screen and (min-width: 850px) {

	.desktop-hidden {
		display: none;
	}
}

</style>
