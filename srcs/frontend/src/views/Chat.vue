<script setup lang="ts">

	import { ref } from 'vue'; 
	import { currentChat, unsetCurrentChat } from '../currentChat';

	import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
	import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
	import ChatMessages from "@/components/chat/ChatMessages.vue";
	import ChannelInfo from '@/components/chat/ChannelInfo.vue';
	import ChatMessagesHeader from '@/components/chat/ChatMessagesHeader.vue';

	const chatOpened = ref(false);
	function toggleChatWindow() {
		chatOpened.value = !chatOpened.value;
	}

	const channelInfoOpened = ref(false);
	function channelInfoOn() {
		channelInfoOpened.value = true;
	}

	function channelInfoOff() {
		channelInfoOpened.value = false;
	}

	function closeCurrentChat() {
		unsetCurrentChat();
		channelInfoOff();
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

			<div class="chat-open" v-if="currentChat">
				<ChatMessagesHeader @close="closeCurrentChat" @channel-info="channelInfoOn"/>
				<ChatMessages v-if="!channelInfoOpened"/>
				<ChannelInfo v-else @close="channelInfoOff"/>
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
		max-height: 450px;
		height: 450px;
	}

	.chats-list {
		width: 100%;
		overflow-y: scroll;
	}
	
	.chat-open {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}


	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.chat-container {
			max-width: 500px;
			margin-left: 0;
		}
	}

</style>
