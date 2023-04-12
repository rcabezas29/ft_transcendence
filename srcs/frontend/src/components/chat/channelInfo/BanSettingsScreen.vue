<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';

const emit = defineEmits(["close-ban-settings"]);

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const amountOfBanTime = ref("");

function banUser(): void {
	if (!channelController.userSelected)
		return;

	channelController.banUser(channelController.userSelected, currentChannel.value.name, amountOfBanTime.value);
	amountOfBanTime.value = "";
    emit("close-ban-settings");
}

function closeBanSettings(): void {
    emit("close-ban-settings");
}

</script>

<template>
    <div class="container">
        <form @submit.prevent="banUser">
            <div class="text-input">
                <TextInputField placeholder-text="enter amount of time in seconds..." v-model="amountOfBanTime"/>
            </div>
            <div class="buttons">
                <Button type="submit" class="button" :selected="true">
                    BAN
                </Button>
                <Button type="button" class="button" @click="closeBanSettings">
                    CANCEL
                </Button>
            </div>
        </form>
    </div>
   
</template>

<style scoped>
    @import "./channelSettingsScreensStyles.scss";
</style>
