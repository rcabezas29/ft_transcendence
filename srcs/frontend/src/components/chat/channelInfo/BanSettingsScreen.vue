<script setup lang="ts">

import { channelController } from '../../../channelController';
import { ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';
import type { ReturnMessage } from '@/interfaces';

const emit = defineEmits(["close-ban-settings"]);

const props = defineProps<{
    channelName: string
}>()

const channel = channelController.channels[props.channelName!];

const amountOfBanTime = ref("");

const errorMessage = ref("");

function banUser(): void {
	if (!channelController.userSelected)
		return;

	const banRet: ReturnMessage = channelController.banUser(channelController.userSelected, channel.name, amountOfBanTime.value);
	if (!banRet.success) {
        errorMessage.value = banRet.message!;
        return;
    }
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
            <div class="error-message">
                {{ errorMessage }}
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
