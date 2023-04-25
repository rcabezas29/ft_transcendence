<script setup lang="ts">
import { directMessageController } from '../../directMessageController';

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

			<div class="chat-card-notification" :class="{'chat-card-notification-on': directMessageController.chats[friend.id].notification}"></div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>
