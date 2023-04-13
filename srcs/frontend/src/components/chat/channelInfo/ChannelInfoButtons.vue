<script setup lang="ts">

import { chatIsChannel, currentChat } from '@/currentChat';
import { computed } from '@vue/reactivity';
import { channelController } from '../../../channelController';
import Button from "../../ui/Button.vue";

const emit = defineEmits(["leave", "ban", "mute", "password", "profile", "admin"]);

const currentChannel = computed(() => {
	return channelController.channels[currentChat.value!.target as string];
})

function managePassword(): void {
	emit("password");
}

function leaveChannel(): void {
	emit("leave");
}

function viewProfile(): void {
	//TODO: redirect to user profile
	console.log("REDIRECT TO PROFILE!!!")
	emit("profile")
}

function manageMute(): void {
	emit("mute");
}

function manageBan(): void {
	emit("ban");
}

function manageAdmin(): void {
	emit("admin");
}

</script>

<template>
    <div v-if="currentChat && chatIsChannel(currentChat)">
        <div class="buttons-section generic-buttons" v-if="!channelController.userSelected">
            <Button class="button" @click="managePassword" v-if="channelController.userIsChannelOwner(currentChannel)" :selected="true">
                MANAGE PASSWORD
            </Button>
            <Button class="button" @click="leaveChannel">
                LEAVE CHANNEL
            </Button>
        </div>
        <div class="buttons-section user-specific-buttons" v-else>
            <Button class="button" @click="viewProfile" :selected="true">
                VIEW PROFILE
            </Button>
            <Button class="button" @click="manageMute" v-if="channelController.userIsChannelAdmin(currentChannel)" :selected="true">
                MUTE
            </Button>
            <Button class="button" @click="manageBan" v-if="channelController.userIsChannelAdmin(currentChannel)" :selected="true">
                BAN
            </Button>
            <Button class="button" @click="manageAdmin" v-if="channelController.userIsChannelOwner(currentChannel)" :selected="true">
                MAKE/REMOVE ADMIN
            </Button>
            <Button class="button" @click="() => channelController.unselectUser()">
                CANCEL
            </Button>
        </div>
    </div>
</template>

<style scoped>
.button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px 30px;
	border-width: 1px;
}

.buttons-section {
	box-sizing: border-box;
	height: 100%;
	width: 80%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	margin: 8px 0px;
}

.user-specific-buttons .button {
	height: 42px;
}

</style>