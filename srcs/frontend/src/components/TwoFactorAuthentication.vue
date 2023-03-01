<script setup lang="ts">
import router from '@/router';
import { user } from '@/user';
import { ref } from 'vue';

const errorMessage = ref<string>('');

const twoFactorAuthenticationCode = ref<string>('');

async function secondFactorAuthenticate() {
    const code = twoFactorAuthenticationCode.value;
    const authenticated = await user.secondFactorAuthenticate(code);
    if (!authenticated) {
        errorMessage.value = 'Error while authenticating with 2FA';
        return;
    }
	router.replace({ "name": "home"});
    errorMessage.value = '';
}
</script>

<template>
    <p>Check your Google Authenticator App and enter the 6 digit code below:</p>
    <form @submit.prevent="secondFactorAuthenticate">
        <input type="text" v-model="twoFactorAuthenticationCode" placeholder="enter 6 digit code">
        <button>submit</button>
    </form>
    <div class="error-message">
        {{ errorMessage }}
    </div>
</template>

<style>
    .error-message {
        color: red;
    }
</style>
