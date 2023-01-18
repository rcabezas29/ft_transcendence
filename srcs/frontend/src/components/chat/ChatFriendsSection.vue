<script setup lang="ts">
import type { Ref } from 'vue';
import ChatSection from './ChatSection.vue';
import { ref, defineProps } from "vue";
import { user } from '../../user';

const props = defineProps({
	chat: null
});

const friends: Ref<string[]> = ref<string[]>([]);

user.socket?.emit('fetch-users');

user.socket?.on('fetch-users', async (fetchedFriends) => {
	friends.value = fetchedFriends;
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