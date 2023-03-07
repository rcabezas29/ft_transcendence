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

	//FIXME: This function should be deleted and used the channelController isChannelMember()
	function userInChannel(channel: string) {
		if (channelController.channels[channel].chat)
			return true;
		return false;
	}

</script>

<template>
	<h2>Channels</h2>

	<li v-for="channel in channelController.channels">
		{{ channel.name }} 
		
		<button
			@click="() => joinChannel(channel.name)"
			v-if="!userInChannel(channel.name)"
		>
			Join channel
		</button>
		<span v-else="userInChannel(channel.name)">
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
