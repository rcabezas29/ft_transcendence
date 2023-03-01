<script setup lang="ts">
import { user } from '@/user';
import { onBeforeMount, ref } from 'vue';

const twoFactorAuthenticationEnabled = ref<boolean>(false);

const qrCode = ref<string>('');

const errorMessage = ref<string>('');

const twoFactorAuthenticationCode = ref<string>('');

async function generateTwoFactorAuthSecret() {
    const httpResponse = await fetch('http://localhost:3000/2fa/generate', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    if (httpResponse.status != 201) {
        errorMessage.value = 'Error while generating 2FA secret and getting QR code';
        return;
    }
    const response = await httpResponse.blob();
    qrCode.value = URL.createObjectURL(response);
    errorMessage.value = '';
}

async function turnOnTwoFactorAuth() {
    const code = twoFactorAuthenticationCode.value;

    const httpResponse = await fetch('http://localhost:3000/2fa/turn-on', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({twoFactorAuthenticationCode: code})
    });
    if (httpResponse.status != 200) {
        errorMessage.value = 'Error while turning on 2FA';
        return;
    }
    errorMessage.value = '';
    qrCode.value = '';

    await secondFactorAuthenticate();
}

async function turnOffTwoFactorAuth() {
    const httpResponse = await fetch('http://localhost:3000/2fa/turn-off', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    if (httpResponse.status != 200) {
        errorMessage.value = 'Error while turning off 2FA';
        return;
    }
    qrCode.value = '';
    errorMessage.value = '';
}

async function secondFactorAuthenticate() {
    const code = twoFactorAuthenticationCode.value;
    const authenticated = await user.secondFactorAuthenticate(code);
    if (!authenticated) {
        errorMessage.value = 'Error while authenticating with 2FA';
        return;
    }
    errorMessage.value = '';
}

async function toggleTwoFactorAuthenticationEnabled() {
    if (twoFactorAuthenticationEnabled.value === true) {
        await generateTwoFactorAuthSecret();
    }
    else {
        await turnOffTwoFactorAuth();
    }
}

onBeforeMount(async () => {
    twoFactorAuthenticationEnabled.value = await user.isTwoFactorAuthenticationEnabled();
})

</script>

<template>
    <b>Enable Two Factor Authentication:</b> <input type="checkbox" id="checkbox" @change="toggleTwoFactorAuthenticationEnabled" v-model="twoFactorAuthenticationEnabled" />
    <div v-if="twoFactorAuthenticationEnabled">
        <p>Scan the QR code with Google Authenticator App and enter the resulting 6 digit code below</p>
        <img :src="qrCode">
        <form @submit.prevent="turnOnTwoFactorAuth">
            <input type="text" v-model="twoFactorAuthenticationCode" placeholder="enter 6 digit code">
            <button>submit</button>
        </form>
    </div>
    <div class="error-message">
        {{ errorMessage }}
    </div>
</template>

<style>
    .error-message {
        color: red;
    }
</style>
