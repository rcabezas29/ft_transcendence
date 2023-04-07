<script setup lang="ts">

	import { ref } from 'vue'; 
	import { currentChat, chatIsChannel } from '../currentChat';

	import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
	import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
	import ChatMessages from "@/components/chat/ChatMessages.vue";
	import ChatChannelUserList from '@/components/chat/ChatChannelUserList.vue';

	const chatOpened = ref(false);

	function toggleChatWindow() {
		chatOpened.value = !chatOpened.value;
	}

</script>

<template>
	<div class="chat-container">
		<div class="chat-header" @click="toggleChatWindow">
			CHAT.EXE
		</div>
		<div class="chat-body" v-if="chatOpened">
			<div>
				<ChatFriendsSection />
				<ChatChannelsSection />
			</div>
			<div v-if="currentChat" class="chat-messages-container">
				<ChatMessages />
				<ChatChannelUserList v-if="chatIsChannel(currentChat)"/>
			</div>
		</div>
		
	</div>

</template>

<style scoped>

	.chat-container {
		position: absolute;
		bottom: 0;
		max-width: 500px;
		width: 100%;
	}

	.chat-header {
		background-color: #1E9052;
		border: 4px solid #4BFE65;
		padding: 8px;
		font-size: 18px;
	}
	
	.chat-body {
		display: flex;
		border: 4px solid #4BFE65;
		border-top: none;
	}

	.chat-messages-container {
		display: flex;
	}

</style>
