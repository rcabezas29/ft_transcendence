<script setup lang="ts">
import ChatChannelUserList from '@/components/chat/channelInfo/ChatChannelUserList.vue';
import { channelController } from '@/channelController';
import { ref } from 'vue';
import BanSettingsScreen from "@/components/chat/channelInfo/BanSettingsScreen.vue";
import MuteSettingsScreen from "@/components/chat/channelInfo/MuteSettingsScreen.vue";
import Button from "../../ui/Button.vue";
import { user } from "@/user";
import router from '@/router';

const props = defineProps<{
    channelName: string
}>()

const channel = channelController.channels[props.channelName!];

const banSettingsOpened = ref<boolean>(false);
function toggleBanScreen(): void {
	banSettingsOpened.value = !banSettingsOpened.value;
}

const muteSettingsOpened = ref<boolean>(false);
function toggleMuteScreen(): void {
	muteSettingsOpened.value = !muteSettingsOpened.value;
}

function kickUser(): void {
	if (!channelController.userSelected)
		return;

	channelController.kickUser(channelController.userSelected, channel.name);
}

function toggleAdmin(): void {
	if (!channelController.userSelected)
		return;
	if (!channelController.userIsChannelAdmin(channel, channelController.userSelected))
		channelController.makeChannelAdmin(channelController.userSelected, channel.name);
	else
		channelController.removeChannelAdmin(channelController.userSelected, channel.name);
}

function viewProfile(): void {
    if (!channelController.userSelected)
        return;
	router.push(`/profile/${channelController.userSelected.id}`);
    channelController.unselectUser();
}

</script>

<template>
    <div class="user-management-container">
        <div class="temporary-settings-screen" v-if="banSettingsOpened">
            <BanSettingsScreen @close-ban-settings="toggleBanScreen" :channel-name="channel.name"/>
        </div>
        <div class="temporary-settings-screen" v-else-if="muteSettingsOpened">
            <MuteSettingsScreen @close-mute-settings="toggleMuteScreen" :channel-name="channel.name"/>
        </div>
        <div class="users-management" v-else>
            <ChatChannelUserList class="info-section user-list" :channel-name="channel.name"/>

            <div class="info-section action-buttons" v-if="channelController.userSelected">
                <div v-if="channelController.userSelected.id === user.id">
                    this is you! select another user
                </div>
                <div v-else class="buttons-section">
                    <Button class="button" @click="viewProfile" :selected="true">
                        VIEW PROFILE
                    </Button>
                    <Button class="button" @click="toggleMuteScreen" :selected="true">
                        MUTE
                    </Button>
                    <Button class="button" @click="toggleBanScreen" :selected="true">
                        BAN
                    </Button>
                    <Button class="button" @click="kickUser" :selected="true">
                        KICK
                    </Button>
                    <Button class="button" @click="toggleAdmin" v-if="!channelController.userIsChannelOwner(channel, channelController.userSelected)" :selected="true">
                        MAKE/REMOVE ADMIN
                    </Button>
                    <Button class="button" @click="() => channelController.unselectUser()">
                        CANCEL
                    </Button>
                </div>
            </div>
            <div v-else class="info-section no-user-selected">SELECT A USER</div>
        </div>

        
    </div>
	
</template>

<style scoped>
.user-management-container {
    display: flex;
    width: 100%;
	height: 450px;
}

.users-management {
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

.action-buttons {
	box-sizing: border-box;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	margin: 8px 0px;
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

.temporary-settings-screen {
    display: flex;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 60px 0px;
}

.button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 14px 30px;
	border-width: 1px;
	height: 50px;
}

.no-user-selected {
    align-items: center;
    justify-content: center;
}

/* Everything bigger than 850px */
@media only screen and (min-width: 850px) {
    .temporary-settings-screen {
        padding: 60px;
    }
}

</style>
