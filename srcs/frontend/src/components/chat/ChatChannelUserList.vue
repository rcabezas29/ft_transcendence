<script setup lang="ts">
import { chatIsChannel, currentChat } from '@/currentChat';
import type { ChatUser } from '@/interfaces';
import { computed } from '@vue/reactivity';
import { ref, watch, type Ref } from 'vue';
import { channelController } from '../../channelController';
import Button from "../ui/Button.vue";

const userSelected: Ref<ChatUser | null> = ref(null);

const currentChannel = computed(() => {
	return channelController.channels[currentChat.value!.target as string];
})

const amountOfBanTime = ref("");
const amountOfMuteTime = ref("");

watch(currentChat, () => {
	userSelected.value = null;
});

function selectUser(user: ChatUser): void {
	userSelected.value = user;
}

function isUserSelected(user: ChatUser): boolean {
	return (user === userSelected.value);
}

function banUser(): void {
	if (!userSelected.value)
		return;

	channelController.banUser(userSelected.value, currentChannel.value.name, amountOfBanTime.value);
	amountOfBanTime.value = "";
}

function muteUser(): void {
	if (!userSelected.value)
		return;
	
	channelController.muteUser(userSelected.value, currentChannel.value.name, amountOfMuteTime.value);
	amountOfMuteTime.value = "";
}

function toggleAdmin(): void {
	if (!userSelected.value)
		return;
	if (!channelController.userIsChannelAdmin(currentChannel.value, userSelected.value))
		channelController.makeChannelAdmin(userSelected.value, currentChannel.value.name);
	else
		channelController.removeChannelAdmin(userSelected.value, currentChannel.value.name);
}

</script>

<template>
	<div class="container" v-if="currentChat && chatIsChannel(currentChat)">
		<div class="info-section user-list">
			<div v-for="user in channelController.channels[currentChat.target as string].users" @click="() => selectUser(user)" :key="user.id">
				<div class="channel-user-card" :class="{'user-selected': isUserSelected(user)}">
					<div class="channel-user-username">
						{{ user.username }}
					</div>
					<div v-if="channelController.userIsChannelOwner(currentChannel, user)" class="user-role">(owner)</div>
					<div v-else-if="channelController.userIsChannelAdmin(currentChannel, user)" class="user-role">(admin)</div>
				</div>
			</div>
		</div>
		<div class="info-section action-buttons">
			<div class="generic-buttons" v-if="!userSelected">
				<Button :selected="true">MANAGE PASSWORD</Button>
				<Button>LEAVE CHANNEL</Button>
			</div>
			<div class="user-specific-buttons" v-else>
				<Button :selected="true">VIEW PROFILE</Button>
				<Button :selected="true">MUTE</Button>
				<Button :selected="true">BAN</Button>
				<Button :selected="true">MAKE ADMIN</Button>
				<Button>CANCEL</Button>
			</div>

		</div>







		<br/>
		<div v-if="channelController.userIsChannelAdmin(currentChannel)">
			<form @submit.prevent="muteUser">
				<input type="text" placeholder="Amount of time in seconds" v-model="amountOfMuteTime">
				<button>Mute</button>
			</form>
		</div>
		<div v-if="channelController.userIsChannelAdmin(currentChannel)">
			<form @submit.prevent="banUser">
				<input type="text" placeholder="Amount of time in seconds" v-model="amountOfBanTime">
				<button>Ban</button>
			</form>
		</div>
		<div v-if="channelController.userIsChannelOwner(currentChannel)">
			<button @click="toggleAdmin">Make / Remove Admin</button>
		</div>
	</div>

	
</template>

<style scoped>
.container {
	height: 100%;
	display: flex;
}

.info-section {
	box-sizing: border-box;
	width: 50%;
	height: 100%;
}

.user-list {
	border-right: 1px solid #1E9052;
	overflow-y: scroll;
}

.channel-user-card {
	padding: 8px 16px;
	display: flex;
	justify-content: flex-start;
}

.user-role {
	margin-left: 8px;
	color: #1E9052;
}

.user-selected {
	background-color: #4BFE65;
	color: #08150C;
}

.user-selected > .user-role {
	color: #08150C;
}

.action-buttons {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.action-buttons button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px 30px;
	/*margin: 16px;*/
	width: 80%;
	/*height: 60px;*/
	border-width: 1px;
}

.user-specific-buttons {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
}

.user-specific-buttons button {
	height: 42px;
	padding: 10px 20px;
}

</style>