<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";

const emit = defineEmits(["close-pwd-settings"]);

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const newPassword = ref<string>("");
function setPassword(): void {
	channelController.setPassword(newPassword.value, currentChannel.value.name);
	newPassword.value = "";
}

function unsetPassword(): void {
	channelController.unsetPassword(currentChannel.value.name);
}

function closePasswordSettings(): void {
    emit("close-pwd-settings");
}

</script>

<template>
    <form @submit.prevent="setPassword">
        <input type="text" placeholder="enter new password" v-model="newPassword">
        <button>Set Password for {{ currentChannel.name }} </button>
    </form>
    <button @click="unsetPassword">
        Unset Password for {{ currentChannel.name }}
    </button>
    <Button @click="closePasswordSettings">CANCEL</Button>
</template>

<style scoped>

</style>
