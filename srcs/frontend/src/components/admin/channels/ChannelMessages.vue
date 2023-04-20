<script setup lang="ts">
import { channelController } from '@/channelController';
import { onMounted, onUpdated } from 'vue';

const props = defineProps({
	channelName: String
});

const channel = channelController.channels[props.channelName!];

function scrollDownChatMessages() {
	const elem = document.querySelector(".chat-messages");
	if (elem)
		elem.scrollTop = elem.scrollHeight;
}

onUpdated(() => {
	scrollDownChatMessages();
})

onMounted(() => {
	scrollDownChatMessages();
})

</script>

<template>
	<div class="chat-messages">
		<div v-for="message in channel.chat?.messages" class="message">
			<div class="chat-message-username">
				{{ `${message.from}:` }}
			</div>
			<div class="chat-message">
				{{ message.message }}
			</div>
		</div>
	</div>
</template>

<style scoped>
	.chat-messages {
		box-sizing: border-box;
		overflow-y: scroll;
		width: 100%;
        padding: 0 24px;
		height: 450px;
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
</style>
