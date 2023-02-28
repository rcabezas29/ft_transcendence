<script setup lang="ts">
import { user } from '@/user';
import { ref } from 'vue';

const twoFactorAuthenticationActive = ref(false);

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

async function turnOnTwoFactorAuth(code: string): Promise<boolean> {
    const httpResponse = await fetch('http://localhost:3000/2fa/turn-on', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({twoFactorAuthenticationCode: code})
    });
    if (httpResponse.status != 200) {
        errorMessage.value = 'Error while turning on 2FA';
        return false;
    }
    return true;
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

async function authenticate(code: string): Promise<boolean> {
    const httpResponse = await fetch('http://localhost:3000/2fa/authenticate', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({twoFactorAuthenticationCode: code})
    });
    if (httpResponse.status != 200) {
        errorMessage.value = 'Error while authenticating with 2FA';
        return false;
    }
    const { access_token } = await httpResponse.json();
    user.auth(access_token);

    return true;
}

async function toggleTwoFactorAuthenticationEnabled() {
    if (twoFactorAuthenticationActive) {
        await generateTwoFactorAuthSecret();
    }
    else {
        await turnOffTwoFactorAuth();
    }
}

async function handleTwoFactorAuthenticationCodeSubmit() {
    const code = twoFactorAuthenticationCode.value;

    qrCode.value = '';
    if (await turnOnTwoFactorAuth(code) === false)
        return;

    if (await authenticate(code) === false)
        return;

    errorMessage.value = '';
}

</script>

<template>
	<b>Enable Two Factor Authentication:</b> <input type="checkbox" id="checkbox" @change="toggleTwoFactorAuthenticationEnabled" v-model="twoFactorAuthenticationActive" />
    <div v-if="twoFactorAuthenticationActive">
        <p>Scan the QR code with Google Authenticator App and enter the resulting 6 digit code below</p>
        <img :src="qrCode">
        <form @submit.prevent="handleTwoFactorAuthenticationCodeSubmit">
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
