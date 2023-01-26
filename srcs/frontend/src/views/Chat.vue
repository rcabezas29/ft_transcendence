<script setup lang="ts">

import { currentChat } from '../currentChat';

import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
import ChatMessages from "@/components/chat/ChatMessages.vue";

</script>

<template>
	<h1>Chat Component</h1>

	<div class="chat-container">
		<div>
			<ChatFriendsSection />
			<ChatChannelsSection />
		</div>
		<ChatMessages v-if="currentChat"/>
	</div>

</template>

<style scoped>

	.chat-container {
		display: flex;
	}

</style>
