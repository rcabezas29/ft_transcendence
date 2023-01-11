<script setup lang="ts">

import ChatFriendsSection from "../components/chat/ChatFriendsSection.vue";
import ChatChannelsSection from "../components/chat/ChatFriendsSection.vue";
import ChatMessages from "@/components/chat/ChatMessages.vue";

import { reactive } from "vue";

interface IUser {
	user: String
}

const user = reactive<IUser>({user: ""});

function handleChatSectionClick(e: Event) {
	
}

</script>

<template>
	<h1>Chat Component</h1>

	<div class="chat-container">
		<div>
			<ChatFriendsSection/>
			<ChatChannelsSection/>
		</div>
		<ChatMessages v-onclick="handleChatSectionClick" :user="user"/>
	</div>

</template>

<style scoped>

	.chat-container {
		display: flex;
	}

</style>
