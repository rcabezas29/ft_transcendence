<script setup lang="ts">
	import { channelController } from '@/channelController';
	import ChatAllChannelsList from '@/components/chat/ChatAllChannelsList.vue';
	import { ref } from 'vue';

	const channelNameInput = ref("");

	function joinChannel(channelName: string) {
		const channel = channelController.channels[channelName];
		let password: string = "";
		if (channel.isPrivate) {
			const insertedPassword: string | null = prompt("Insert channel password")
			if (insertedPassword != null)
				password = insertedPassword
			else
				password = ""
		}

		channelController.joinChannel(channelName, password);
	}

	function createChat(e: Event) {
		if (channelNameInput.value.length == 0)
			return;
		channelController.createChannel(channelNameInput.value);
		channelNameInput.value = "";
	}

</script>

<template>
	<h2>Channels</h2>

	<!-- use COMPONENT? -->
	<ChatAllChannelsList />

	<li v-for="channel in channelController.channels">
		{{ channel.name }} 
		
		<button
			@click="() => joinChannel(channel.name)"
			v-if="!channelController.userIsMemberOfChannel(channel.name)"
		>
			Join channel
		</button>
		<span v-else="channelController.userIsMemberOfChannel(channel.name)">
			Already joined
		</span>
	</li>

	<div>
		<form @submit.prevent="createChat">
			New channel:
			<input type="text" v-model="channelNameInput">
			<button>Create</button>
		</form>
	</div>

</template>

<style scoped>

	li {
		border: 1px solid black;
		width: fit-content;
	}

</style>
