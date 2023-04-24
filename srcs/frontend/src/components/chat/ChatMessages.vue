<script setup lang="ts">
import { type Ref, ref, onUpdated, onMounted } from 'vue'; 
import { directMessageController } from '@/directMessageController';
import { currentChat, chatIsChannel, chatIsDirectMessage } from '@/currentChat';
import { channelController } from '@/channelController';
import router from '@/router';

const messageInput: Ref<string> = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0 || !currentChat.value)
		return;
	if (chatIsDirectMessage(currentChat.value))
		directMessageController.sendDirectMessage(messageInput.value);
	else if (chatIsChannel(currentChat.value))
		channelController.sendChannelMessage(messageInput.value);
	messageInput.value = "";
}

function challengeThroughChat() {
	directMessageController.sendChallenge();
}

function scrollDownChatMessages() {
	const elem = document.querySelector(".chat-messages");
	if (elem)
		elem.scrollTop = elem.scrollHeight;
}

onUpdated(() => {
	scrollDownChatMessages();
});

onMounted(() => {
	scrollDownChatMessages();
});

function	acceptChallenge(friendId: number) {
	directMessageController.acceptChallenge(friendId);
	router.replace('game');
}

function	refuseChallenge(friendId: number) {
	directMessageController.refuseChallenge(friendId);
}

</script>

<template>
	<button v-if="chatIsDirectMessage(currentChat!) && !currentChat?.challenge" v-on:click="challengeThroughChat()">Challenge</button>

	<div class="chat-messages">
		<div class="challenge-request" v-if="currentChat?.challenge">
			<button v-on:click="acceptChallenge(currentChat.target.id)">Accept</button>
			<button v-on:click="refuseChallenge(currentChat.target.id)">Refuse</button>
		</div>
		<div v-else v-for="message in currentChat!.messages" class="message">
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
</template>

<style scoped>
	.chat-messages {
		box-sizing: border-box;
		overflow-y: scroll;
		height: 100%;
		width: 100%;
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

	.chat-message-input {
		width: 100%;
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
</style>