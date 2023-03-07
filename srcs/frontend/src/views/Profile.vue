<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { user, type UserData } from '../user';
import TwoFactorAuthenticationSetup from '../components/TwoFactorAuthenticationSetup.vue';

const username = ref<string>("");
const password = ref<string>("");
const avatarImage = ref<Blob | null>(null);
const userData = ref<UserData | null>(null);
const previewImage = ref();
const message = ref<string>('');
const messageClass = ref<string>('error-message');

const userImg = computed(() => {
    if (user.username)
        return `http://localhost:3000/users/avatar/${user.username}`;
    else
        return "";
});

async function changeUsername() {
    if (await user.updateUsername(username.value) === false) {
        messageClass.value = "error-message";
        message.value = "error while updating username";
        return;
    }
    user.username = username.value;
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
    avatarImage.value = e.target.files[0];
    if (!avatarImage.value)
        return;

    const reader = new FileReader();
    reader.onload = function(event) {
        if (!event.target)
            return;
        previewImage.value = event.target.result;
    };
    reader.readAsDataURL(avatarImage.value);
}

function uploadAvatar() {
    if (!avatarImage.value)
        return;
    user.updateAvatar(avatarImage.value);
}

onBeforeMount(async () => {
    userData.value = await user.fetchAllUserData();
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
            <img id="user-image" :src="userImg" />
            <img :src="previewImage" class="uploading-image" />
            <form @submit.prevent="uploadAvatar">
                <input type="file" accept="image/jpeg" @change="loadAvatarPreview"/>
                <button v-if="avatarImage">submit</button>
            </form>
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
            <h2>Email</h2>
            <p>Email: {{ userData?.email }}</p>
        </div>
        <div class="section">
            <h2>Password</h2>
            <p>Password: *****</p>
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
    .section {
        margin-bottom: 20px;
    }

    #user-image {
        display: block;
        width: 100px;
        height: 100px;
    }

    .uploading-image{
        display:flex;
        max-width: 100px;
    }

    .error-message {
		color: red;
	}

	.success-message {
		color: green;
	}

</style>
