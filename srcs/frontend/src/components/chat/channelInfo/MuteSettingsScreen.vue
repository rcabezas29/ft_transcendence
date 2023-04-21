<script setup lang="ts">

import { channelController } from '../../../channelController';
import { ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';

const emit = defineEmits(["close-mute-settings"]);

const props = defineProps<{
    channelName: string
}>()

const channel = channelController.channels[props.channelName!];

const amountOfMuteTime = ref("");

function muteUser(): void {
	if (!channelController.userSelected)
		return;
	
	channelController.muteUser(channelController.userSelected, channel.name, amountOfMuteTime.value);
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
