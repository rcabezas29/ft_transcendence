<script setup lang="ts">
import { directMessageController } from '../../directMessageController';
import MailUnreadIcon from "@/components/icons/MailUnreadIcon.vue";

function handleClick(e: Event, friendId: number) {
	directMessageController.setCurrentChat(friendId);
}

const backendURL = import.meta.env.VITE_BACKEND_URL;

</script>

<template>
	<div class="chat-section">
		<div class="chat-card" @click="(e: Event) => handleClick(e, friend.id)" v-for="friend in directMessageController.friends" :key="friend.id">
			<div class="chat-card-info">
				<div class="chat-card-avatar">
					<img :src="`${backendURL}/users/avatar/${friend.id}`"/>
				</div>
				<div class="chat-card-name">
					{{ friend.username }}
				</div>
			</div>
			<div class="chat-card-notification" v-show="directMessageController.chats[friend.id].notification">
				<MailUnreadIcon width="20" height="20"/>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>
