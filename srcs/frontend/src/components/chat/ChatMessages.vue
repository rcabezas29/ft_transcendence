<script setup lang="ts">
import { type Ref, ref, onUpdated, onMounted, computed } from 'vue'; 
import { directMessageController } from '@/directMessageController';
import { currentChat, chatIsChannel, chatIsDirectMessage } from '@/currentChat';
import { channelController } from '@/channelController';
import router from '@/router';
import Button from '@/components/ui/Button.vue';
import { user } from '@/user';
import { friendsController, type Friend, FriendStatus } from '@/friendsController';
import type { ChatUser } from '@/interfaces';
import { ChallengeState } from '@/interfaces/chat/chat.interface';

const messageInput: Ref<string> = ref<string>("");

function onSubmit(e: Event) {
	if (messageInput.value.length == 0 || !currentChat.value)
		return;
	if (chatIsDirectMessage(currentChat.value))
		directMessageController.sendDirectMessage(messageInput.value);
	else if (chatIsChannel(currentChat.value))
		channelController.sendChannelMessage(messageInput.value);
	messageInput.value = "";
}

function challengeThroughChat() {
	directMessageController.sendChallenge();
}

function scrollDownChatMessages() {
	const elem = document.querySelector(".chat-messages");
	if (elem)
		elem.scrollTop = elem.scrollHeight;
}

onUpdated(() => {
	scrollDownChatMessages();
});

onMounted(() => {
	scrollDownChatMessages();
});

function acceptChallenge(friendId: number) {
	directMessageController.acceptChallenge(friendId);
	router.replace({ "name": "game" });
}

function refuseChallenge(friendId: number) {
	directMessageController.refuseChallenge(friendId);
}

const canChallenge = computed(() => {
	if (!currentChat.value)
		return false;

	const friendId = (<ChatUser>currentChat.value.target).id;
	const friend: Friend = friendsController.friends[friendId];

	return (chatIsDirectMessage(currentChat.value)
		&& currentChat.value.challenge === ChallengeState.None
		&& friend.status != FriendStatus.gaming
		&& !user.isGaming()
	);
});
/*
const canWatchGame = computed(() => {
	if (!currentChat.value)
		return false;

	const friendId = (<ChatUser>currentChat.value.target).id;
	const friend: Friend = friendsController.friends[friendId];

	return (chatIsDirectMessage(currentChat.value)
		//&& !currentChat.value.challenge
		&& friend.status === FriendStatus.gaming
		// && self status isnt gaming either
	);
});
*/
</script>

<template>
	<div class="challenge-button">
		<Button v-if="canChallenge" v-on:click="challengeThroughChat">
			challenge
		</Button>
		<Button v-else-if="currentChat?.challenge === ChallengeState.Challenger" :selected="true">
			challenge is pending
		</Button>
		<!--
		<Button v-else-if="canWatchGame">
			watch game
		</Button>
		-->
	</div>

	<div class="chat-messages">
		<div v-for="message in currentChat!.messages" class="message" v-show="!friendsController.userIsBlocked(message.from.id)">
			<div class="chat-message-username">
				{{ `${user.id == message.from.id ? "you" : message.from.username}:` }}
			</div>
			<div class="chat-message">
				{{ message.message }}
			</div>
		</div>
		<div class="challenge-request" v-if="chatIsDirectMessage(currentChat!) && currentChat?.challenge === ChallengeState.Challenged">
			<div>{{ (<ChatUser>currentChat.target).username }} challenged you</div>
			<div class="choice-buttons">
				<Button @click="acceptChallenge((<ChatUser>currentChat!.target).id)">ACCEPT</Button>
				<Button @click="refuseChallenge((<ChatUser>currentChat!.target).id)">REFUSE</Button>
			</div>
		</div>
	</div>

	<form @submit.prevent="onSubmit" class="chat-message-input">
		<input type="text" v-model="messageInput" placeholder="$>"/>
	</form>
</template>

<style scoped>
	.chat-messages {
		box-sizing: border-box;
		overflow-y: scroll;
		height: 100%;
		width: 100%;
        padding: 0 24px;
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

	.chat-message-input {
		width: 100%;
	}

	.chat-message-input input {
		box-sizing: border-box;
        font-family: vp-pixel;
		background-color: #08150C;
        color: #B3F9D7;
		border: none;
        border-top: 4px solid #4BFE65;
		width: 100%;
        height: 38px;
        padding: 0 24px;
	}

	.challenge-button {
		display: flex;
		width: 100%;
		justify-content: center;
		padding: 10px;
		box-sizing: border-box;
	}

	.challenge-button > button {
		padding: 10px 10px;
		width: 100%;
	}

	.challenge-request {
		display: flex;
		width: 60%;
		flex-direction: column;
		align-items: center;
		border: solid 1px #4BFE65;
		background-color: #1E9052;
		padding: 10px;
		gap: 10px;
		margin: 10px 0px;
	}

	.choice-buttons {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	.choice-buttons button {
		padding: 10px 10px;
		width: 40%;
	}
</style>