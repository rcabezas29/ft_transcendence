<script setup lang="ts">

import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
import ChatChannelsSection from "../components/chat/ChatChannelsSection.vue";
import ChatMessages from "@/components/chat/ChatMessages.vue";
import { reactive } from "vue";

interface Message {
	from: string,
	message: string
}

interface Chat {
	from: string,
	messages: Message[]
}

const chat = reactive<Chat>({from: "", messages: []});

</script>

<template>
	<h1>Chat Component</h1>

	<div class="chat-container">
		<div>
			<ChatFriendsSection :chat="chat"/>
			<ChatChannelsSection/>
		</div>
		<ChatMessages v-if="chat.from != ''" :chat="chat"/>
	</div>

</template>

<style scoped>

	.chat-container {
		display: flex;
	}

</style>
