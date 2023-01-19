<script setup lang="ts">

import { type Ref, ref } from 'vue'; 
import { chatController } from "../../chatController"

const messageInput: Ref<string> = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0)
		return;
	chatController.sendDirectMessage(messageInput.value);
	messageInput.value = "";
}

</script>

<template>
	<div>
		<div class="chat-messages-container">
			<div class="chat-container-title">
				{{ chatController.currentChat!.friend.username }}
			</div>
			<div v-for="message in chatController.currentChat!.messages" class="chat-message-container">
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