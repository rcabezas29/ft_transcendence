<script setup lang="ts">

import { currentChat, chatIsChannel } from '../currentChat';

import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
import ChatMessages from "@/components/chat/ChatMessages.vue";
import ChatChannelUserList from '@/components/chat/ChatChannelUserList.vue';

</script>

<template>
	<h1>Chat Component</h1>

	<div class="chat-container">
		<div>
			<ChatFriendsSection />
			<ChatChannelsSection />
		</div>
		<div v-if="currentChat" class="chat-messages-container">
			<ChatMessages />
			<ChatChannelUserList v-if="chatIsChannel(currentChat)"/>
		</div>
	</div>

</template>

<style scoped>

	.chat-container {
		display: flex;
	}

	.chat-messages-container {
		display: flex;
	}

</style>
