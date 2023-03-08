<script setup lang="ts">
	import { channelController } from '@/channelController';

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


</script>

<template>
	<h2>Channels</h2>

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

</template>

<style scoped>

	li {
		border: 1px solid black;
		width: fit-content;
	}

</style>
