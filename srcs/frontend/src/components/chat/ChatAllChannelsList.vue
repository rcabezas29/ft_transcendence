<script setup lang="ts">
import { channelController } from '@/channelController';
import { ref, type Ref } from 'vue';

const channelSelected: Ref<string> = ref("");

const password = ref("");

function joinChannel(): void {
	if (channelSelected.value)
		channelController.joinChannel(channelSelected.value, password.value);
	password.value = "";
}

</script>

<template>
	<div class="channels-list">
		<div v-for="channel in channelController.channels" @click="() => channelSelected = channel.name" :key="channel.name">
			<div class="channel-name-card" :class="{'channel-selected': channelSelected === channel.name}">
				<div class="channel-name">
					{{ channel.name }}
				</div>
				<div v-if="channel.isPrivate" class="private-channel-indicator">private</div>
			</div>
		</div>
	</div>
	<div class="join-channel-button" v-if="channelSelected && channelController.userIsMemberOfChannel(channelSelected) === false">
		<form @submit.prevent="joinChannel">
			<input v-if="channelController.channels[channelSelected].isPrivate" type="text" placeholder="enter password" v-model="password">
			<button>join channel</button>
		</form>
	</div>
</template>

<style scoped>
	.channel-name-card {
		display: flex;
		justify-content: space-between;
		border: 1px solid black;
	}

	.channel-selected {
		background-color: Gray;
	}

	.private-channel-indicator {
		color: #aeadad;
	}

	.join-channel-button {
		margin-bottom: 50px;
	}
</style>