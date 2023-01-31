<script setup lang="ts">
import { channelController } from '@/channelController';
import { ref, type Ref } from 'vue';

const channelSelected: Ref<string> = ref("");

function joinChannel(): void {
if (channelSelected.value)
	channelController.joinChannel(channelSelected.value);
}

</script>

<template>
	<div class="channels-list">
		<div v-for="channel in channelController.channels" @click="() => channelSelected = channel.name" :key="channel.name">
			<div class="channel-name" :class="{'channel-selected': channelSelected === channel.name}" >
				{{ channel.name }}
			</div>
		</div>
	</div>
	<div class="join-channel-button" v-if="channelSelected && channelController.userIsMemberOfChannel(channelSelected) === false">
		<button @click="joinChannel">join channel</button>
	</div>
</template>

<style scoped lang="scss">
	.channels-list {
		margin-bottom: 30px;
	}
	.channel-selected {
		background-color: grey;
	}

	.join-channel-button {
		margin-bottom: 50px;
	}
</style>