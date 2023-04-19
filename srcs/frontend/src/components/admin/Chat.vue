<script setup lang="ts">
	import { ref } from "vue";
	import ChatChannelsSection from "./ChatChannelsSection.vue";
	import ChatMessagesHeader from "./ChatMessagesHeader.vue";
	import ChatMessages from "./ChatMessages.vue";
	import ChannelInfo from "./channelInfo/ChannelInfo.vue";

	const chatOpened = ref(false);

	function toggleChat() {
		chatOpened.value = !chatOpened.value;
	}

</script>

<template>
	<div>
		delete this -> <button @click="toggleChat">Open chat</button>
	</div>

	<div v-if="!chatOpened">
		<ChatChannelsSection/>
	</div>
	<div v-else>
		<ChatMessagesHeader />
		<ChatMessages/>
		<ChannelInfo/>
	</div>

	<ChannelInfo/>
</template>

<style scoped>
</style>