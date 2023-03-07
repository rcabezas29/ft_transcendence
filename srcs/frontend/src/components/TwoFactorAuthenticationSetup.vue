<script setup lang="ts">
import { user } from '@/user';
import { onBeforeMount, ref } from 'vue';

const twoFactorAuthCheckboxActive = ref<boolean>(false);

const twoFactorAuthEnabled = ref<boolean>(false);

const qrCode = ref<string>('');

const message = ref<string>('');
const messageClass = ref<string>('error-message');

const twoFactorAuthenticationCode = ref<string>('');

async function generateTwoFactorAuthSecret() {
    const httpResponse = await fetch('http://localhost:3000/2fa/generate', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${user.token}`
        }
    });
    if (httpResponse.status != 201) {
        message.value = 'Error while generating 2FA secret and getting QR code';
        return;
    }
    const response = await httpResponse.blob();
    qrCode.value = URL.createObjectURL(response);
    message.value = '';
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
        message.value = 'Error while turning on 2FA';
        return;
    }
    message.value = '';
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
        message.value = 'Error while turning off 2FA';
        return;
    }
    twoFactorAuthEnabled.value = false;
    qrCode.value = '';
    message.value = '';
}

async function secondFactorAuthenticate() {
    const code = twoFactorAuthenticationCode.value;
    const authenticated = await user.secondFactorAuthenticate(code);
    if (!authenticated) {
        message.value = 'Error while authenticating with 2FA';
        return;
    }
    message.value = "You have successfully activated 2FA!";
	messageClass.value = "success-message";
    twoFactorAuthEnabled.value = true;
}

async function toggleTwoFactorAuthCheckbox() {
    if (twoFactorAuthCheckboxActive.value === true) {
        await generateTwoFactorAuthSecret();
    }
    else {
        await turnOffTwoFactorAuth();
    }
}

onBeforeMount(async () => {
    twoFactorAuthEnabled.value = await user.isTwoFactorAuthenticationEnabled();
    if (twoFactorAuthEnabled.value == true)
        twoFactorAuthCheckboxActive.value = true;
})

</script>

<template>
    <p>Enable Two Factor Authentication:
        <input type="checkbox" id="checkbox" @change="toggleTwoFactorAuthCheckbox" v-model="twoFactorAuthCheckboxActive" />
    </p>
    <div v-if="twoFactorAuthCheckboxActive && !twoFactorAuthEnabled">
        <p>Scan the QR code with Google Authenticator App and enter the resulting 6 digit code below</p>
        <img :src="qrCode">
        <form @submit.prevent="turnOnTwoFactorAuth">
            <input type="text" v-model="twoFactorAuthenticationCode" placeholder="enter 6 digit code">
            <button>submit</button>
        </form>
    </div>
    <div :class='messageClass'>
        {{ message }}
    </div>
</template>

<style>
	.error-message {
		color: red;
	}

	.success-message {
		color: green;
	}
</style>
