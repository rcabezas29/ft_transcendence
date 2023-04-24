<script setup lang="ts">
import { computed } from 'vue';
import { channelController } from '@/channelController';
import type { Channel } from '@/interfaces';

function handleClick(e: Event, channel: string) {
	channelController.setCurrentChat(channel);
}

const channels = computed(() => {
	const channels: Channel[] = [];
	for (let channel in channelController.channels) {
		if (channelController.channels[channel].chat && channelController.userIsMemberOfChannel(channel))
			channels.push(channelController.channels[channel]);
	}
	return (channels);
})
</script>

<template>
	<div class="chat-section">
		<div @click="(e: Event) => handleClick(e, channel.name)" v-for="channel in channels" :key="channel.name" class="chat-card">
			
			<div class="chat-card-info">
				<div class="chat-card-avatar">
					<img src="@/assets/group_avatar.jpg"/>
				</div>
				<div class="chat-card-name">
					{{ channel.name }}
				</div>
			</div>
			<div class="chat-card-notification" :class="{'chat-card-notification-on': channel.chat!.notification}"></div>
		</div>

	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>