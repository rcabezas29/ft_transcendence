<script setup lang="ts">

import { type Ref, ref, onUpdated } from 'vue'; 
import { directMessageController } from '@/directMessageController';
import { currentChat } from '@/currentChat';

const messageInput: Ref<string> = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0)
		return;
	directMessageController.sendDirectMessage(messageInput.value);
	messageInput.value = "";
}

function scrollDownChatMessages() {
	const elem = document.querySelector(".chat-messages-container");
	if (elem)
		elem.scrollTop = elem.scrollHeight;
}

function getChatName(): string {
	if (currentChat.value == null)
		return "";

	if ( typeof currentChat.value.target == "string")
		return currentChat.value.target;

	return currentChat.value.target.username;
}

onUpdated(() => {
	scrollDownChatMessages();
})

</script>

<template>
	<div>
		<div class="chat-messages-container">
			<div class="chat-container-title">
				{{ getChatName() }}
			</div>
			<div v-for="message in currentChat!.messages" class="chat-message-container">
				<div class="chat-message-username">
					{{ message.from }}
				</div>
				<div class="chat-message">
					{{ message.message }}
				</div>
			</div>
		</div>
		<form @submit.prevent="onSubmit" class="chat-message-input">
			<input type="text" v-model="messageInput"/>
			<button type="submit" >Send</button>
		</form>
	</div>
	
</template>

<style scoped>
	.chat-messages-container {
		border: 1px solid black;
		margin-left: 10px;
		width: 300px;
		height: 300px;
		overflow-y: scroll; 
	}

	.chat-message-container {
		margin: 4px 0;
	}

	.chat-message-username {
		font-weight: bold;
	}

	.chat-container-title {
		font-weight: bold;
		border-bottom: 5px solid black;
		margin-bottom: 20px;
	}

	.chat-message-input {
		margin-left: 10px;
	}
</style>