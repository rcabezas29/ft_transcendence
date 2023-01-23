<script setup lang="ts">

import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
import ChatMessages from "@/components/chat/ChatMessages.vue";
import { chatController } from "@/chatController";

</script>

<template>
	<h1>Chat Component</h1>

	<div class="chat-container">
		<div>
			<ChatFriendsSection />
			<ChatChannelsSection />
		</div>
		<ChatMessages v-if="chatController.hasCurrentChat()" />
	</div>

</template>

<style scoped>

	.chat-container {
		display: flex;
	}

</style>
