<script setup lang="ts">

import { currentChat, chatIsChannel } from '@/currentChat'
import { channelController } from '../../../channelController';
import ChatChannelUserList from '@/components/chat/channelInfo/ChatChannelUserList.vue';
import CrossIcon from "../../icons/CrossIcon.vue";
import ChannelInfoButtons from './ChannelInfoButtons.vue';
import { computed, ref, watch } from 'vue';
import Button from "../../ui/Button.vue";

const emit = defineEmits(["close"]);

function closeInfo() {
    emit("close");
	channelController.userSelected = null;
}

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const amountOfBanTime = ref("");
const amountOfMuteTime = ref("");

function banUser(): void {
	if (!channelController.userSelected)
		return;

	channelController.banUser(channelController.userSelected, currentChannel.value.name, amountOfBanTime.value);
	amountOfBanTime.value = "";
}

function muteUser(): void {
	if (!channelController.userSelected)
		return;
	
	channelController.muteUser(channelController.userSelected, currentChannel.value.name, amountOfMuteTime.value);
	amountOfMuteTime.value = "";
}

function toggleAdmin(): void {
	if (!channelController.userSelected)
		return;
	if (!channelController.userIsChannelAdmin(currentChannel.value, channelController.userSelected))
		channelController.makeChannelAdmin(channelController.userSelected, currentChannel.value.name);
	else
		channelController.removeChannelAdmin(channelController.userSelected, currentChannel.value.name);
}

const banSettingsOpened = ref<boolean>(false);
function toggleBanScreen(): void {
	banSettingsOpened.value = !banSettingsOpened.value;
}

const muteSettingsOpened = ref<boolean>(false);
function toggleMuteScreen(): void {
	muteSettingsOpened.value = !muteSettingsOpened.value;
}

const passwordSettingsOpened = ref<boolean>(false);
function togglePasswordScreen(): void {
	passwordSettingsOpened.value = !passwordSettingsOpened.value;
}

const newPassword = ref<string>("");
function setPassword(e: Event, channel: string): void {
	channelController.setPassword(newPassword.value, channel);
	newPassword.value = "";
}

function unsetPassword(e: Event, channel: string): void {
	channelController.unsetPassword(channel);
}

function leaveChannel(channel: string): void {
	channelController.leaveChannel(channel);
    closeInfo();
}

</script>

<template>
	<div class="info-container" v-if="currentChat && chatIsChannel(currentChat)">
        <div class="info-window">
            <div class="info-header">
                <span class="title">channel info</span>
                <span class="exit-button" @click="closeInfo">
                    <CrossIcon cross-colour="#1E9052"/>
                </span>
            </div>
            <div class="info-body">
                <div class="temporary-settings-screen" v-if="banSettingsOpened && channelController.userIsChannelAdmin(currentChannel)">
                    <form @submit.prevent="banUser">
                        <input type="text" placeholder="Amount of time in seconds" v-model="amountOfBanTime">
                        <button>Ban</button>
                    </form>
                    <Button @click="toggleBanScreen">CANCEL</Button>
                </div>
                <div class="temporary-settings-screen" v-else-if="muteSettingsOpened && channelController.userIsChannelAdmin(currentChannel)">
                    <form @submit.prevent="muteUser">
                        <input type="text" placeholder="Amount of time in seconds" v-model="amountOfMuteTime">
                        <button>Mute</button>
                    </form>
                    <Button @click="toggleMuteScreen">CANCEL</Button>
                </div>
                <div class="temporary-settings-screen" v-else-if="passwordSettingsOpened && channelController.userIsChannelOwner(currentChannel)">
                    <form @submit.prevent="(e) => setPassword(e, currentChat!.target as string)">
                        <input type="text" placeholder="enter new password" v-model="newPassword">
                        <button>Set Password for {{ currentChat!.target as string }} </button>
                    </form>
                    <button @click="(e) => unsetPassword(e, currentChat!.target as string)">
                        Unset Password for {{ currentChat!.target as string }}
                    </button>
                    <Button @click="togglePasswordScreen">CANCEL</Button>
                </div>
                <div class="channel-info" v-else>
                    <ChatChannelUserList class="info-section user-list"/>
                    <ChannelInfoButtons class="info-section action-buttons"
                        @leave="leaveChannel(currentChannel.name)"
                        @password="togglePasswordScreen"
                        @mute="toggleMuteScreen"
                        @ban="toggleBanScreen"
                        @admin="toggleAdmin"
                    />
                </div>
            </div>
        </div>
	</div>

</template>

<style scoped>
    .info-container {
		box-sizing: border-box;
		width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .info-window {
        box-sizing: border-box;
        background-color: #08150C;
		border: 1px solid #1E9052;
		width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
    }

    .info-header {
		box-sizing: border-box;
		font-family: vp-pixel;
		color: #B3F9D7;
		background-color: #1E9052;
		padding: 6px;
		height: 36px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.exit-button {
		background-color: #B3F9D7;
		padding: 4px;
		display: inline-flex;
		position: absolute;
		right: 6px;
	}

	.exit-button:hover {
		cursor: pointer;
	}

    .info-body {
        width: 100%;
        height: 100%;
        /*background-color: #ae1af2;*/
    }

    .channel-info {
        display: flex;
        width: 100%;
        height: 100%;
        /*background-color: #1a2cf2;*/
    }

    .temporary-settings-screen {
        display: flex;
        width: 100%;
        /*background-color: #c7f21a;*/
    }

    .info-section {
        box-sizing: border-box;
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .user-list {
        border-right: 1px solid #1E9052;
        overflow-y: scroll;
    }

    .action-buttons {
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
    }

</style>
