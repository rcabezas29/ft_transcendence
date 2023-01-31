<script setup lang="ts">
import { computed, ref } from 'vue';
import { channelController } from '@/channelController';
import ChatAllChannelsList from './ChatAllChannelsList.vue';
import type { Channel } from '@/interfaces';
import { chatIsChannel, currentChat } from '@/currentChat';

function handleClick(e: Event, channel: string) {
	channelController.setCurrentChat(channel);
}

const channelNameInput = ref("");

const newPassword = ref("");

function createChat(e: Event) {
	if (channelNameInput.value.length == 0)
		return;
	channelController.createChannel(channelNameInput.value);
	channelNameInput.value = "";
}

function leaveChannel(e: Event, channel: string): void {
	channelController.leaveChannel(channel);
}

function setPassword(e: Event, channel: string): void {
	channelController.setPassword(newPassword.value, channel);
	newPassword.value = "";
}

function unsetPassword(e: Event, channel: string): void {
	channelController.unsetPassword(channel);
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

const showPasswordForm = computed(() => {
	return (currentChat.value
		&& chatIsChannel(currentChat.value)
		&& channelController.userIsChannelOwner(channelController.channels[currentChat.value.target as string]));
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
			<div v-if="showPasswordForm" class="password-form">
				<form @submit.prevent="(e) => setPassword(e, currentChat!.target as string)">
					<input type="text" placeholder="enter new password" v-model="newPassword">
					<button>Set Password for {{ currentChat!.target as string }} </button>
				</form>
				<button @click="(e) => unsetPassword(e, currentChat!.target as string)">
					Unset Password for {{ currentChat!.target as string }}
				</button>
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

	.password-form {
		margin-top: 20px;
	}
</style>