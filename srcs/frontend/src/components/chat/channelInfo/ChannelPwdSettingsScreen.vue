<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";
import TextInputField from '@/components/ui/TextInputField.vue';

const emit = defineEmits(["close-pwd-settings"]);

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const newPassword = ref<string>("");
function setPassword(): void {
	channelController.setPassword(newPassword.value, currentChannel.value.name);
	newPassword.value = "";
    emit("close-pwd-settings");
}

function unsetPassword(): void {
	channelController.unsetPassword(currentChannel.value.name);
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
