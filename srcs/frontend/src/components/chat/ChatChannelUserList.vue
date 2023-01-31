<script setup lang="ts">
import { chatIsChannel, currentChat } from '@/currentChat';
import type { ChatUser } from '@/interfaces';
import { computed } from '@vue/reactivity';
import { ref, watch, type Ref } from 'vue';
import { channelController } from '../../channelController'

const userSelected: Ref<ChatUser | null> = ref(null);

const selectedUsername = computed(() => {
	return (userSelected.value ? userSelected.value.username : "");
})

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

function muteUser( ): void {
	if (!userSelected.value)
		return;
	console.log("muting")
	amountOfMuteTime.value = "";
}

function toggleAdmin( ): void {
	if (!userSelected.value)
		return;
	console.log("making/removing admin")
}

</script>

<template>
	<div v-if="currentChat && chatIsChannel(currentChat)">
		<h3>Channel Users list</h3>
		<div>
			User selected: <b><span>{{ selectedUsername }}</span></b>
			<br/>
			<div v-if="channelController.userIsChannelAdmin(currentChannel)">
				<form @submit.prevent="muteUser">
					<input type="text" placeholder="Amount of time" v-model="amountOfMuteTime">
					<button>Mute / Unmute</button>
				</form>
			</div>
			<div v-if="channelController.userIsChannelAdmin(currentChannel)">
				<form @submit.prevent="banUser">
					<input type="text" placeholder="Amount of time" v-model="amountOfBanTime">
					<button>Ban</button>
				</form>
			</div>
			<div v-if="channelController.userIsChannelOwner(currentChannel)">
				<button @click="toggleAdmin">Make / Remove Admin</button>
			</div>
		</div>
		<div class="users-list">
			<div v-for="user in channelController.channels[currentChat.target as string].users" @click="() => selectUser(user)" :key="user.id">
				<div class="channel-user-username" :class="{'user-selected': isUserSelected(user)}" >
					{{ user.username }}
				</div>
			</div>
		</div>
	</div>
	
</template>

<style scoped>
.users-list {
	border: 1px solid black;
	margin-top: 20px;
}

.user-selected {
	background-color: grey;
}
</style>