<script setup lang="ts">
import { chatController } from "../../chatController"

function handleClick(e: Event, friendId: number) {
	chatController.setCurrentChat(friendId);
}

</script>

<template>
	<div>
		<div class="chat-divider">
			Friends
		</div>
		<div class="chat-section">
			<div @click="(e: Event) => handleClick(e, friend.id)" v-for="friend in chatController.friends" :key="friend.id" class="chat-card">
				<div class="chat-card-name">
					{{ friend.username }}
				</div>
				<div class="chat-card-notification" :class="{'chat-card-notification-on': chatController.chats[friend.id].notification}"></div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>