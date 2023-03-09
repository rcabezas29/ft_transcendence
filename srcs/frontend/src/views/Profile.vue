<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { user } from '../user';
import TwoFactorAuthenticationSetup from '../components/TwoFactorAuthenticationSetup.vue';
import AvatarCropper from '../components/AvatarCropper.vue';
import type { UserData } from "@/interfaces";

const username = ref<string>('');
const password = ref<string>('');
const userData = ref<UserData | null>(null);
const previewImageURL = ref<string | null>(null);
const message = ref<string>('');
const messageClass = ref<string>('error-message');

async function changeUsername() {
    if (await user.updateUsername(username.value) === false) {
        messageClass.value = "error-message";
        message.value = "error while updating username";
        return;
    }
    messageClass.value = "success-message";
    message.value = "username updated successfully!";
}

async function changePassword() {
    if (await user.updatePassword(password.value) === false) {
        messageClass.value = "error-message";
        message.value = "error while updating password";
        return;
    }
    messageClass.value = "success-message";
    message.value = "password updated successfully!";
}

function loadAvatarPreview(e: any) {
    const avatarImage = e.target.files[0];
    if (!avatarImage)
        return;

    const reader = new FileReader();
    reader.onload = function(event) {
        if (!event.target)
            return;
            previewImageURL.value = event.target.result as string | null;
    };
    reader.readAsDataURL(avatarImage);
}

function cancelAvatarPreview() {
    previewImageURL.value = null;
}

async function updateAvatar(imageBlob: Blob) {
    const avatarUpdated = await user.updateAvatar(imageBlob);
    if (avatarUpdated === false) {
        messageClass.value = "error-message";
        message.value = "error while updating avatar";
        return;
    }
    previewImageURL.value = null;
    messageClass.value = "success-message";
    message.value = "avatar updated successfully!";
}

onBeforeMount(async () => {
    userData.value = await user.fetchUserData();
})

</script>

<template>
	
	<h1>hola, this is {{ user.username }}'s profile</h1>
    <div :class='messageClass'>
        {{ message }}
    </div>

    <div class="user-info">
        <div class="section">
            <h2>Avatar</h2>
            <div class="avatar-section">
                <img id="user-image" :src="user.avatarImageURL" />
                <input type="file" accept="image/jpeg" @change="loadAvatarPreview"/>
            </div>
            <div v-if="previewImageURL">
                <AvatarCropper  :avatar-url="previewImageURL" @crop="updateAvatar" class="image-cropper" />
                <button @click="cancelAvatarPreview">cancel</button>
            </div>
        </div>
        <div class="section">
            <h2>Username</h2>
            <p>Username: {{ user.username }}</p>
            <form @submit.prevent="changeUsername">
                <label>new username: </label>
                <input type="text" v-model="username"/>
                <button>submit</button>
            </form>
        </div>
        <div class="section">
            <h2>Intra username</h2>
            <p>Intra username: {{ userData?.intraUsername }}</p>
        </div>
        <div class="section">
            <h2>Email</h2>
            <p>Email: {{ userData?.email }}</p>
        </div>
        <div class="section">
            <h2>Password</h2>
            <form @submit.prevent="changePassword">
                <label>new password: </label>
                <input type="text" v-model="password"/>
                <button>submit</button>
            </form>
        </div>
        <div class="section">
            <h2>Two Factor Authentication</h2>
            <TwoFactorAuthenticationSetup/>
        </div>
        <div class="section">
            <h2>All other user data</h2>
            In case we want to use any of it for this section
            <ul>
                <li>Id: {{ userData?.id }}</li>
                <li>Username: {{ userData?.username }}</li>
                <li>Intra username: {{ userData?.intraUsername }}</li>
                <li>Email: {{ userData?.email }}</li>
                <li>Avatar: {{ userData?.avatar }}</li>
                <li>Elo: {{ userData?.elo }}</li>
                <li>Stats: {{ userData?.stats }}</li>
                <li>Is 2fa enabled: {{ userData?.isTwoFactorAuthenticationEnabled }}</li>
            </ul>
        </div>
    </div>

	
</template>

<style scoped>
    .user-info {
        display: flex;
        flex-wrap: wrap;
    }
    .section {
        margin: 20px;
        width: 30%;
        background-color: #f6f6f6;
    }

    .avatar-section {
        display: flex;
        align-items: center;
    }

    #user-image {
        display: block;
        width: 100px;
        height: 100px;
        margin: 10px;
    }

    .image-cropper{
        display:flex;
        max-width: 300px;
    }

    .error-message {
		color: red;
	}

	.success-message {
		color: green;
	}

</style>
