<script setup lang="ts">

import { channelController } from '../../../channelController';
import { ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';
import type { ReturnMessage } from '@/interfaces';

const emit = defineEmits(["close-mute-settings"]);

const props = defineProps<{
    channelName: string
}>()

const channel = channelController.channels[props.channelName!];

const amountOfMuteTime = ref("");

const errorMessage = ref("");

function muteUser(): void {
	if (!channelController.userSelected)
		return;
	
	const muteRet: ReturnMessage = channelController.muteUser(channelController.userSelected, channel.name, amountOfMuteTime.value);
    if (!muteRet.success) {
        errorMessage.value = muteRet.message!;
        return;
    }
	amountOfMuteTime.value = "";
    emit("close-mute-settings");
}

function closeMuteSettings(): void {
    emit("close-mute-settings");
}

</script>

<template>
    <div class="container">
        <form @submit.prevent="muteUser">
            <div class="text-input">
                <TextInputField placeholder-text="enter amount of time in seconds..." v-model="amountOfMuteTime"/>
            </div>
            <div class="error-message">
                {{ errorMessage }}
            </div>
            <div class="buttons">
                <Button type="submit" class="button" :selected="true">
                    MUTE
                </Button>
                <Button type="button" class="button" @click="closeMuteSettings">
                    CANCEL
                </Button>
            </div>
        </form>
    </div>
</template>

<style scoped>
    @import "./channelSettingsScreensStyles.scss";
</style>
