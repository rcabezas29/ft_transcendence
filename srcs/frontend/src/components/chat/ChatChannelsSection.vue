<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { channelController } from '@/channelController';
import type { Channel } from '@/interfaces';

function handleClick(e: Event, channel: string) {
	channelController.setCurrentChat(channel);
}

const channelNameInput = ref("");

const channelSelected: Ref<Channel | null> = ref(null);

function createChat(e: Event) {
	if (channelNameInput.value.length == 0)
		return;
	channelController.createChannel(channelNameInput.value);
	channelNameInput.value = "";
}



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
			<div @click="(e: Event) => handleClick(e, channel.name)" v-for="channel in channelController.channels" :key="channel.name" class="chat-card">
				<div class="chat-card-name">
					{{ channel.name }}
				</div>
				<div class="chat-card-notification" :class="{'chat-card-notification-on': channelController.chats[channel.name].notification}"></div>
			</div>
		</div>
		<div class="chat-divider">
			All Channels
		</div>
		<div class="channels-list">
			<div v-for="channel in channelController.channels" @click="() => channelSelected = channel" :key="channel.name">
				<div class="channel-name" :class="{'channel-selected': channelSelected === channel}" >
					{{ channel.name }}
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";

	.channel-selected {
		background-color: grey;
	}
</style>