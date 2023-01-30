<script setup lang="ts">
import { chatIsChannel, currentChat } from '@/currentChat';
import type { Channel, ChatUser } from '@/interfaces';
import { computed } from '@vue/reactivity';
import { ref, watch, type Ref } from 'vue';
import { channelController } from '../../channelController'

const userSelected: Ref<ChatUser | null> = ref(null);

const currentChannel: Ref<Channel | null> = ref(null);

function selectUser(user: ChatUser): void {
	userSelected.value = user;
}

function isUserSelected(user: ChatUser): boolean {
	return (user === userSelected.value);
}

watch(currentChat, () => {
	userSelected.value = null;
	if (currentChat.value && chatIsChannel(currentChat.value))
		currentChannel.value = channelController.findChannelFromChannelName(currentChat.value.target as string);
}, {immediate: true});

const selectedUsername = computed(() => {
	return (userSelected.value ? userSelected.value.username : "");
})

</script>

<template>
	<div v-if="currentChannel">
		<h3>Channel Users list</h3>
		<div>
			User selected: <b><span>{{ selectedUsername }}</span></b>
			<br/>
			<div v-if="channelController.userIsChannelAdmin(currentChannel)">
				<input type="text" placeholder="Amount of time"/><button>Mute / Unmute</button>
			</div>
			<div v-if="channelController.userIsChannelAdmin(currentChannel)">
				<input type="text" placeholder="Amount of time"/><button>Ban / Unban</button>
			</div>
			<div v-if="channelController.userIsChannelOwner(currentChannel)">
				<button >Make / Revert Admin</button>
			</div>
		</div>
		<div class="users-list">
			<div v-for="user in currentChannel.users" @click="() => selectUser(user)" :key="user.id">
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