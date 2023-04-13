<script setup lang="ts">
import { chatIsChannel, currentChat } from '@/currentChat';
import { computed } from '@vue/reactivity';
import { channelController } from '../../../channelController';

const currentChannel = computed(() => {
	return channelController.channels[currentChat.value!.target as string];
})

</script>

<template>
	<div class="container" v-if="currentChat && chatIsChannel(currentChat)">
		<div v-for="user in channelController.channels[currentChat.target as string].users" @click="() => channelController.selectUser(user)" :key="user.id">
			<div class="channel-user-card" :class="{'user-selected': channelController.isUserSelected(user)}">
				<div class="channel-user-username">
					{{ user.username }}
				</div>
				<div v-if="channelController.userIsChannelOwner(currentChannel, user)" class="user-role">
					(owner)
				</div>
				<div v-else-if="channelController.userIsChannelAdmin(currentChannel, user)" class="user-role">
					(admin)
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.container {
	height: 100%;
	display: flex;
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

</style>