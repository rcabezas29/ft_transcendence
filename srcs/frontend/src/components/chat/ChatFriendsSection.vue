<script setup lang="ts">
 
import router from '@/router';
import { directMessageController } from '../../directMessageController';

function handleClick(e: Event, friendId: number) {
	directMessageController.setCurrentChat(friendId);
}

function	acceptChallenge(friendId: number) {
	directMessageController.acceptChallenge(friendId);
	router.replace('game');
}

function	refuseChallenge(friendId: number) {
	directMessageController.refuseChallenge(friendId);
	// router.replace('game');
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
			<div v-if="directMessageController.chats[friend.id].challenge">
				<button v-on:click="acceptChallenge(friend.id)">Accept</button>
				<button v-on:click="refuseChallenge(friend.id)">Refuse</button>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	@import "./chatSectionStyles.scss";
</style>
