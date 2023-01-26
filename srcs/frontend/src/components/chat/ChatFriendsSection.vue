<script setup lang="ts">
 
import { directMessageController } from '../../directMessageController';

function handleClick(e: Event, friendId: number) {
	directMessageController.setCurrentChat(friendId);
}

</script>

<template>
	<div>
		<div class="chat-divider">
			Friends
		</div>
		<div class="chat-section">
			<div @click="(e: Event) => handleClick(e, friend.id)" v-for="friend in directMessageController.friends" :key="friend.id" class="chat-card">
				<div class="chat-card-name">
					{{ friend.username }}
				</div>
				<div class="chat-card-notification" :class="{'chat-card-notification-on': directMessageController.chats[friend.id].notification}"></div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>