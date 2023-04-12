<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";

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
}

function closeBanSettings(): void {
    emit("close-ban-settings");
}

</script>

<template>
    <form @submit.prevent="banUser">
        <input type="text" placeholder="Amount of time in seconds" v-model="amountOfBanTime">
        <button>Ban</button>
    </form>
    <Button @click="closeBanSettings">CANCEL</Button>
</template>

<style scoped>

</style>
