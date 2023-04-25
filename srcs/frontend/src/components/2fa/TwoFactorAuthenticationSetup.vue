<script setup lang="ts">
import { user } from '@/user';
import { onBeforeMount, ref } from 'vue';
import Button from "../ui/Button.vue";
import Modal from "../ui/Modal.vue";
import TextInputField from "../ui/TextInputField.vue";

const twoFactorAuthEnabled = ref<boolean>(false);

const qrCode = ref<string>('');

const message = ref<string>('');
const messageClass = ref<string>('error-message');

const twoFactorAuthenticationCode = ref<string>('');

async function generateTwoFactorAuthSecret() {
    const httpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/2fa/generate`, {
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
}

async function secondFactorAuthenticate() {
    const code = twoFactorAuthenticationCode.value;
    const authenticated = await user.secondFactorAuthenticate(code);
    if (!authenticated.success) {
        message.value = authenticated.message!;
        return;
    }
    message.value = "You have successfully activated 2FA!";
	messageClass.value = "success-message";
    twoFactorAuthEnabled.value = true;
}

async function turnOnTwoFactorAuth() {
    const turnedOn: boolean = await user.turnOnTwoFactorAuth(twoFactorAuthenticationCode.value);
    if (!turnedOn) {
        message.value = 'Error while turning on 2FA';
        return;
    }
    await secondFactorAuthenticate();
    closeTwoFactorAuthModal();
}

async function turnOffTwoFactorAuth() {
    const turnedOff: boolean = await user.turnOffTwoFactorAuth();
    if (!turnedOff) {
        message.value = 'Error while turning off 2FA';
        return;
    }
    twoFactorAuthEnabled.value = false;
    closeTwoFactorAuthModal();
}

let twoFactorAuthModalVisible = ref<boolean>(false);
async function openTwoFactorAuthModal() {
    if (!twoFactorAuthEnabled.value)
        await generateTwoFactorAuthSecret();

	messageClass.value = "error-message";
    message.value = '';
    twoFactorAuthModalVisible.value = true;
}

async function closeTwoFactorAuthModal() {
    qrCode.value = '';
    message.value = '';
    twoFactorAuthModalVisible.value = false;
}

onBeforeMount(async () => {
    twoFactorAuthEnabled.value = await user.isTwoFactorAuthenticationEnabled();
})

</script>

<template>
    <div class="twofa-button">
        <Button :selected="twoFactorAuthEnabled" @click="openTwoFactorAuthModal" >
            {{ twoFactorAuthEnabled ? "2FA ENABLED" : "2FA DISABLED"}}
        </Button>
    </div>

    <Modal v-if="!twoFactorAuthEnabled" :visible="twoFactorAuthModalVisible" @close="turnOffTwoFactorAuth" title="SET UP 2FA">
        <div class="modal-content">
            <p>Scan the QR code with Google Authenticator App and enter the resulting 6 digit code below</p>
            <img :src="qrCode">
            <form class="form" @submit.prevent="turnOnTwoFactorAuth">
			    <TextInputField style="height: 60px" placeholder-text="ENTER 6 DIGIT CODE" v-model="twoFactorAuthenticationCode"/>
                <div :class='messageClass'>
                    {{ message }}
                </div>
                <div class="modal-buttons">
                    <Button type="submit" :selected="true">SUBMIT</Button>
                    <Button type="button" @click="turnOffTwoFactorAuth">CANCEL</Button>
                </div>
            </form>
        </div>
    </Modal>
    <Modal v-if="twoFactorAuthEnabled" :visible="twoFactorAuthModalVisible" @close="closeTwoFactorAuthModal" title="DISABLE 2FA">
        <div class="modal-content">
            <p>Two factor authentication is enabled. Would you like to disable it?</p>
            <div :class='messageClass'>
                {{ message }}
            </div>
            <div class="modal-buttons">
                <Button @click="turnOffTwoFactorAuth" :selected="true">DEACTIVATE</Button>
                <Button @click="closeTwoFactorAuthModal">CANCEL</Button>
            </div>
        </div>
    </Modal>
</template>

<style scoped>
	.error-message {
		color: #EC3F74;
	}

    .twofa-button button {
		padding: 10px 20px;
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .modal-content .form {
        width: 100%;
    }

    .form {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
    }

    .modal-content img {
        max-width: 300px;
        margin-bottom: 20px;
    }

    .modal-buttons {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        gap: 10px;
        margin-top: 20px;
    }

    /* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
        .modal-buttons {
            flex-direction: row;
            width: 80%;
        }
	}
</style>
