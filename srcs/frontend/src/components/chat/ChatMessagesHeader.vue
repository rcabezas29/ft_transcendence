<script setup lang="ts">
import { computed } from 'vue'; 
import { currentChat, chatIsChannel, chatIsDirectMessage } from '@/currentChat';
import type { ChatUser } from '../../interfaces';
import BackArrow from '@/components/icons/BackArrow.vue';
import groupAvatar from '@/assets/group_avatar.jpg';

const emit = defineEmits<{
	(e: 'channel-info'): void
	(e: 'close'): void
}>()

const chatName = computed(() => {
	if (currentChat.value) {
		if (chatIsChannel(currentChat.value))
			return currentChat.value.target as string;
		else if (chatIsDirectMessage(currentChat.value))
			return (<ChatUser>currentChat.value.target).username;
	}
	return "";
})

const chatAvatar = computed(() => {
	if (currentChat.value) {
		if (chatIsChannel(currentChat.value))
			return groupAvatar;
		else if (chatIsDirectMessage(currentChat.value))
			return `${import.meta.env.VITE_BACKEND_URL}/users/avatar/${(<ChatUser>currentChat.value.target).id}`;
	}
	return "";
})

function goToProfile() {
	if (!currentChat.value)
		return;
	//TODO: redirect to user profile
	console.log(`REDIRECT TO USER PROFILE WITH ID: ${(<ChatUser>currentChat.value.target).id}`)
}

function goToChannelInfo() {
	emit("channel-info");
}

function handleTitleClick() {
	if (!currentChat.value)
		return;
	if (chatIsDirectMessage(currentChat.value))
		goToProfile();
	else if (chatIsChannel(currentChat.value))
		goToChannelInfo();
}

function handleBackArrowClick() {
    emit("close");
}

</script>

<template>
    <div class="chat-container-header">
        <div class="back-arrow" @click="handleBackArrowClick">
            <BackArrow/>
        </div>
        <div class="chat-title" @click="handleTitleClick">
            {{ chatName }}
        </div>
        <div class="chat-avatar">
            <img :src="chatAvatar"/>
        </div>
    </div>
</template>

<style scoped>
	.chat-container-header {
		box-sizing: border-box;
		background-color: #1E9052;
		border-bottom: 4px solid #4BFE65;
		font-size: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 8px;
		width: 100%;
	}

	.back-arrow {
		height: 30px;
		width: 30px;
		display: flex;
		align-items: center;
	}

	.back-arrow:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-title:hover {
		cursor: pointer;
		color: #08150C;
	}

	.chat-avatar {
		display: flex;
	}

	.chat-avatar img {
		box-sizing: border-box;
		border: 1px solid #4BFE65;
		padding: 2px;
		width: 30px;
		background-color: #08150C;
	}
</style>
