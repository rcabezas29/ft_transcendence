<script setup lang="ts">

import { chatIsChannel, currentChat } from '@/currentChat';
import { computed } from '@vue/reactivity';
import { channelController } from '../../../channelController';
import Button from "../../ui/Button.vue";
import { user } from "@/user";

const emit = defineEmits(["leave", "ban", "kick", "mute", "password", "profile", "admin"]);

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
	emit("profile")
}

function manageMute(): void {
	emit("mute");
}

function manageBan(): void {
	emit("ban");
}

function manageKick(): void {
    emit("kick");
}

function manageAdmin(): void {
	emit("admin");
}

const canMute = computed(() => {
    return (
        channelController.userIsChannelAdmin(currentChannel.value)
        && channelController.userSelected
        && !channelController.userIsChannelOwner(currentChannel.value, channelController.userSelected)
    );
});

const canBan = computed(() => {
    return (
        channelController.userIsChannelAdmin(currentChannel.value)
        && channelController.userSelected
        && !channelController.userIsChannelOwner(currentChannel.value, channelController.userSelected)
    );
});

const canKick = computed(() => {
    return (
        channelController.userIsChannelAdmin(currentChannel.value)
        && channelController.userSelected
        && !channelController.userIsChannelOwner(currentChannel.value, channelController.userSelected)
    );
});

const canManageAdmins = computed(() => {
    return (
        channelController.userIsChannelOwner(currentChannel.value)
    );
});

</script>

<template>
    <div v-if="currentChat && chatIsChannel(currentChat)">
        <div class="buttons-section generic-buttons" v-if="!channelController.userSelected || channelController.userSelected.id == user.id">
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
            <Button class="button" @click="manageMute" v-if="canMute" :selected="true">
                MUTE
            </Button>
            <Button class="button" @click="manageBan" v-if="canBan" :selected="true">
                BAN
            </Button>
            <Button class="button" @click="manageKick" v-if="canKick" :selected="true">
                KICK
            </Button>
            <Button class="button" @click="manageAdmin" v-if="canManageAdmins" :selected="true">
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
	padding: 14px 30px;
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
	height: 38px;
}

</style>