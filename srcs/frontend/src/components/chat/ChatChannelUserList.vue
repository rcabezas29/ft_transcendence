<script setup lang="ts">
import { currentChat } from '@/currentChat';
import type { ChatUser } from '@/interfaces';
import { computed } from '@vue/reactivity';
import { ref, watch, type Ref } from 'vue';
import { channelController } from '../../channelController'

const userSelected: Ref<ChatUser | null> = ref(null);

function selectUser(user: ChatUser): void {
	userSelected.value = user;
}

function isUserSelected(user: ChatUser): boolean {
	return (user === userSelected.value);
}

watch(currentChat, () => {
	userSelected.value = null;
});

const selectedUsername = computed(() => {
	return (userSelected.value ? userSelected.value.username : "");
})

</script>

<template>
	<div>
		<h3>Channel Users list</h3>
		<div>
			User selected: <b><span>{{ selectedUsername }}</span></b>
			<br/>
			<input type="text" placeholder="Amount of time"/><button>Mute / Unmute</button>
			<br/>
			<input type="text" placeholder="Amount of time"/><button>Ban / Unban</button>
			<br/>
			<button>Make / Revert Admin</button>
			<br/>
		</div>
		<div class="users-list">
			<div v-for="user in channelController.currentChannel!.users" @click="() => selectUser(user)" :key="user.id">
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
}

.user-selected {
	background-color: grey;
}

</style>