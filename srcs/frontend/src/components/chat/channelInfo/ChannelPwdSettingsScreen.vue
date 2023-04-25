<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';
import type { ReturnMessage } from '@/interfaces';

const emit = defineEmits(["close-pwd-settings"]);

const errorMessage = ref("");

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const newPassword = ref<string>("");
function setPassword(): void {
	const pwdReturn: ReturnMessage = channelController.setPassword(newPassword.value, currentChannel.value.name);
	if (!pwdReturn.success) {
        errorMessage.value = pwdReturn.message!;
        return;
    }
    
    newPassword.value = "";
    emit("close-pwd-settings");
}

function unsetPassword(): void {
	const pwdReturn: ReturnMessage = channelController.unsetPassword(currentChannel.value.name);
    if (!pwdReturn.success) {
        errorMessage.value = pwdReturn.message!;
        return;
    }

    emit("close-pwd-settings");
}

function closePasswordSettings(): void {
    emit("close-pwd-settings");
}

</script>

<template>
    <div class="container">
        <form @submit.prevent="setPassword">
            <div class="text-input"> 
                <TextInputField type="password" placeholder-text="enter new password..." v-model="newPassword"/>
            </div>
            <div class="error-message">
                {{ errorMessage }}
            </div>
            <div class="buttons">
                <Button type="submit" class="button" :selected="true">
                    SAVE
                </Button>
                <Button type="button" class="button" v-if="currentChannel.isPrivate" @click="unsetPassword" :selected="true">
                    UNSET PASSWORD
                </Button>
                <Button type="button" class="button" @click="closePasswordSettings">
                    CANCEL
                </Button>
            </div>
        </form>
    </div>
</template>

<style scoped>
    @import "./channelSettingsScreensStyles.scss";

    .button {
        padding: 12px 30px;
    }
</style>
