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
			<div v-if="!currentChat" class="chats-list">
				<ChatFriendsSection />
				<ChatChannelsSection />
			</div>

			<div v-if="currentChat" class="chat-open">
				<ChatMessages />
				<!--
				<ChatChannelUserList v-if="chatIsChannel(currentChat)"/>
				-->
			</div>
		</div>
		
	</div>

</template>

<style scoped>

	.chat-container {
		box-sizing: border-box;
		position: fixed;
		bottom: 0;
		margin-left: -24px;
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: #27aad6;
	}

	.chat-header {
		box-sizing: border-box;
		background-color: #1E9052;
		border: 4px solid #4BFE65;
		padding: 8px;
		font-size: 18px;
		height: 42px;
		display: flex;
		align-items: center;
	}
	
	.chat-body {
		display: flex;
		border: 4px solid #4BFE65;
		border-top: none;
		background-color: #08150C;
		min-height: 450px;
	}

	.chats-list {
		width: 100%;
		overflow-y: scroll;
	}
	
	.chat-open {
		width: 100%;
	}


	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.chat-container {
			max-width: 500px;
			margin-left: 0;
		}
	}

</style>
