<script setup lang="ts">
import { channelController } from '../../../channelController';

const props = defineProps({
	channelName: String
});

const channel = channelController.channels[props.channelName!];

</script>

<template>
	<div class="container">
		<div v-for="user in channelController.channels[channel.name].users" class="channel-user-card" :class="{'user-selected': channelController.isUserSelected(user)}" @click="() => channelController.selectUser(user)" :key="user.id">
			<div class="channel-user-username">
				{{ user.username }}
			</div>
			<div v-if="channelController.userIsChannelOwner(channel, user)" class="user-role">
				(owner)
			</div>
			<div v-else-if="channelController.userIsChannelAdmin(channel, user)" class="user-role">
				(admin)
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
	cursor: pointer;
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