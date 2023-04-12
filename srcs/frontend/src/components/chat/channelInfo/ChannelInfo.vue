<script setup lang="ts">

import { currentChat, chatIsChannel } from '@/currentChat'
import { channelController } from '../../../channelController';
import ChatChannelUserList from '@/components/chat/channelInfo/ChatChannelUserList.vue';
import CrossIcon from "../../icons/CrossIcon.vue";
import ChannelInfoButtons from './ChannelInfoButtons.vue';
import { computed, ref } from 'vue';
import BanSettingsScreen from "./BanSettingsScreen.vue";
import MuteSettingsScreen from "./MuteSettingsScreen.vue";
import ChannelPwdSettingsScreen from "./ChannelPwdSettingsScreen.vue";

const emit = defineEmits(["close"]);

function closeInfo() {
    emit("close");
	channelController.userSelected = null;
}

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

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

function leaveChannel(channel: string): void {
	channelController.leaveChannel(channel);
    closeInfo();
}

function toggleAdmin(): void {
	if (!channelController.userSelected)
		return;
	if (!channelController.userIsChannelAdmin(currentChannel.value, channelController.userSelected))
		channelController.makeChannelAdmin(channelController.userSelected, currentChannel.value.name);
	else
		channelController.removeChannelAdmin(channelController.userSelected, currentChannel.value.name);
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
                    <BanSettingsScreen @close-ban-settings="toggleBanScreen"/>
                </div>
                <div class="temporary-settings-screen" v-else-if="muteSettingsOpened && channelController.userIsChannelAdmin(currentChannel)">
                    <MuteSettingsScreen @close-mute-settings="toggleMuteScreen"/>
                </div>
                <div class="temporary-settings-screen" v-else-if="passwordSettingsOpened && channelController.userIsChannelOwner(currentChannel)">
                    <ChannelPwdSettingsScreen @close-pwd-settings="togglePasswordScreen"/>
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
    }

    .channel-info {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .temporary-settings-screen {
        display: flex;
        width: 100%;
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
