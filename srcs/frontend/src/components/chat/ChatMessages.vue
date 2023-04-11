<script setup lang="ts">
import { type Ref, ref, onUpdated, computed } from 'vue'; 
import { directMessageController } from '@/directMessageController';
import { currentChat, chatIsChannel, chatIsDirectMessage, unsetCurrentChat } from '@/currentChat';
import type { ChatUser } from '../../interfaces';
import { channelController } from '@/channelController';
import BackArrow from '@/components/icons/BackArrow.vue';
import groupAvatar from '@/assets/group_avatar.jpg';

const messageInput: Ref<string> = ref<string>("");
//const chatAvatar = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0 || !currentChat.value)
		return;
	if (chatIsDirectMessage(currentChat.value))
		directMessageController.sendDirectMessage(messageInput.value);
	else if (chatIsChannel(currentChat.value))
		channelController.sendChannelMessage(messageInput.value);
	messageInput.value = "";
}

function	challengeThroughChat() {
	directMessageController.sendChallenge();
}

function scrollDownChatMessages() {
	const elem = document.querySelector(".chat-messages-container");
	if (elem)
		elem.scrollTop = elem.scrollHeight;
}

function getChatName(): string {
	if (currentChat.value) {
		if (chatIsChannel(currentChat.value))
			return currentChat.value.target as string;
		else if (chatIsDirectMessage(currentChat.value))
			return (<ChatUser>currentChat.value.target).username;
	}
	return ""
}

const chatAvatar = computed(() => {
	if (currentChat.value) {
		if (chatIsChannel(currentChat.value))
			return groupAvatar;
		else if (chatIsDirectMessage(currentChat.value))
			return `http://localhost:3000/users/avatar/${(<ChatUser>currentChat.value.target).id}`;
	}
	return ""
})

function goToProfile() {
	console.log("go to profile!! ")
}

onUpdated(() => {
	scrollDownChatMessages();
})

</script>

<template>
	<div class="container">
		<div class="chat-container-header">
			<div class="back-arrow" @click="unsetCurrentChat">
				<BackArrow/>
			</div>
			<div class="chat-title" @click="goToProfile">
				{{ getChatName() }}
			</div>
			<div class="chat-avatar">
				<img :src="chatAvatar"/>

			</div>
		</div>
		<button v-if="chatIsDirectMessage(currentChat!)" v-on:click="challengeThroughChat()">Challenge</button>
		<div class="chat-container-body">
			<div v-for="message in currentChat!.messages" class="message">
				<div class="chat-message-username">
					{{ `${message.from}:` }}
				</div>
				<div class="chat-message">
					{{ message.message }}
				</div>
			</div>
		</div>
		<form @submit.prevent="onSubmit" class="chat-message-input">
			<input type="text" v-model="messageInput" placeholder="$>"/>
		</form>
	</div>
	
</template>

<style scoped>
	.container {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.chat-container-body {
		overflow-y: scroll;
		height: 100%;
        padding: 0 24px;
	}

	.message {
		display: flex;
	}

	.chat-message-username {
		color: #1E9052;
		margin-right: 10px;
	}

	.chat-message {
		color: #B3F9D7;
		overflow-wrap: anywhere;
	}

	.chat-container-header {
		box-sizing: border-box;
		background-color: #1E9052;
		border-bottom: 4px solid #4BFE65;
		font-size: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 8px;
	}

	.chat-message-input input {
		box-sizing: border-box;
        font-family: vp-pixel;
		background-color: #08150C;
        color: #B3F9D7;
		border: none;
        border-top: 4px solid #4BFE65;
		width: 100%;
        height: 38px;
        padding: 0 24px;
	}

	.back-arrow {
		height: 30px;
		width: 30px;
		display: flex;
		align-items: center;
	}

	.back-arrow:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-title:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-avatar {
		display: flex;
	}

	.chat-avatar img {
		box-sizing: border-box;
		border: 1px solid #4BFE65;
		padding: 2px;
		width: 30px;
		background-color: #08150C;
	}
</style>