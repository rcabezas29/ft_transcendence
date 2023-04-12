<script setup lang="ts">

import { currentChat } from '@/currentChat'
import { channelController } from '../../../channelController';
import { computed, ref } from 'vue';
import Button from "../../ui/Button.vue";

const emit = defineEmits(["close-mute-settings"]);

const currentChannel = computed(() => {
    return channelController.channels[currentChat.value!.target as string];
})

const amountOfMuteTime = ref("");

function muteUser(): void {
	if (!channelController.userSelected)
		return;
	
	channelController.muteUser(channelController.userSelected, currentChannel.value.name, amountOfMuteTime.value);
	amountOfMuteTime.value = "";
}

function closeMuteSettings(): void {
    emit("close-mute-settings");
}

</script>

<template>
     <form @submit.prevent="muteUser">
        <input type="text" placeholder="Amount of time in seconds" v-model="amountOfMuteTime">
        <button>Mute</button>
    </form>
    <Button @click="closeMuteSettings">CANCEL</Button>
</template>

<style scoped>

</style>
