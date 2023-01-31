<script setup lang="ts">
import { computed, ref } from 'vue';
import { channelController } from '@/channelController';
import ChatAllChannelsList from './ChatAllChannelsList.vue';
import type { Channel } from '@/interfaces';

function handleClick(e: Event, channel: string) {
	channelController.setCurrentChat(channel);
}

const channelNameInput = ref("");

function createChat(e: Event) {
	if (channelNameInput.value.length == 0)
		return;
	channelController.createChannel(channelNameInput.value);
	channelNameInput.value = "";
}

function leaveChannel(e: Event, channel: string): void {
	channelController.leaveChannel(channel);
}

const channels = computed(() => {
	const channels: Channel[] = [];
	for (let channel in channelController.channels)
	{
		if (channelController.channels[channel].chat)
			channels.push(channelController.channels[channel]);
	}
	return (channels);
})

</script>

<template>
	<div>
		<div class="chat-divider">
			My Channels
		</div>
		<div>
			<form @submit.prevent="createChat">
				New channel:
				<input type="text" v-model="channelNameInput">
				<button>Create</button>
			</form>
		</div>
		<div class="chat-section">
			<div @click="(e: Event) => handleClick(e, channel.name)" v-for="channel in channels" :key="channel.name" class="chat-card">
				<div class="chat-card-name">
					{{ channel.name }}
				</div>
				<button @click.stop="(e: Event) => leaveChannel(e, channel.name)">Leave channel</button>
				<div class="chat-card-notification" :class="{'chat-card-notification-on': channel.chat!.notification}"></div>
			</div>
		</div>
		<div class="chat-divider">
			All Channels
		</div>
		<ChatAllChannelsList />
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>