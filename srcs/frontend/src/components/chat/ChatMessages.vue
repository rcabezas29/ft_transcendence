<script setup lang="ts">

import { defineProps, ref } from 'vue';
import type { Ref } from 'vue'; 
import { user } from '../../user';

const props = defineProps({
	chat: null
});

const messageInput: Ref<string> = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0)
		return;

	user.socket?.emit("message", { to: props.chat.from, message: messageInput.value });
	props.chat.messages = [...props.chat.messages, { from: user.socket?.id, message: messageInput.value }]
	messageInput.value = "";
}

user.socket?.on("message", (payload) => {
	props.chat.messages = [...props.chat.messages, payload];
});

</script>

<template>
	<div>
		<div class="chat-messages-container">
			<div class="chat-container-title">
				{{ props.chat?.from }}
			</div>
			<div v-for="message in props.chat.messages" class="chat-message-container">
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