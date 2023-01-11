<script setup lang="ts">
import type { Ref } from 'vue';
import ChatSection from './ChatSection.vue';
import { ref, defineProps } from "vue";
import { user } from '../../user';

const props = defineProps({
	chat: null
});

const friends: Ref<string[]> = ref<string[]>([]);

user.socket?.on('fetch_users', async (message) => {
	const fetchedFriends = await JSON.parse(message);
	friends.value = [...fetchedFriends].filter((id) => user.socket?.id != id);
});

function handleClick(e: Event, chatId: string) {
	props.chat.from = chatId;
}

</script>

<template>
	<div>
		<div class="chat-divider">
			Friends
		</div>
		<ChatSection :sections="friends" :handleClick="handleClick"/>
	</div>
</template>

<style scoped>

</style>