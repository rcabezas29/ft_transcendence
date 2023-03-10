<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { user } from '../user';
import TwoFactorAuthenticationSetup from '../components/TwoFactorAuthenticationSetup.vue';
import AvatarCropper from '../components/AvatarCropper.vue';
import type { UserData } from "@/interfaces";

const username = ref<string>('');
const password = ref<string>('');
const userData = ref<UserData | null>(null);
const avatarImage = ref<Blob | null>(null);
const cropperImg = ref<string | null>(null);
const imagePreview = computed(() => {
    if (avatarImage.value)
        return URL.createObjectURL(avatarImage.value);
    return "";
})

const message = ref<string[]>([]);
const editMode = ref<boolean>(false);

function loadAvatarPreview(e: any) {
    const image = e.target.files[0];
    if (!image)
        return;

    const reader = new FileReader();
    reader.onload = function(event) {
        if (!event.target)
            return;
            cropperImg.value = event.target.result as string | null;
    };
    reader.readAsDataURL(image);
}

function cancelAvatarPreview() {
    cropperImg.value = null;
}

function updateAvatar(imageBlob: Blob) {
    avatarImage.value = imageBlob;
    cropperImg.value = null;
}

function editModeOn() {
    editMode.value = true;
}

function editModeOff() {
    username.value = "";
    password.value = "";
    avatarImage.value = null;
    cancelAvatarPreview();
    message.value = [];
    editMode.value = false;
}

async function saveChanges() {
    message.value = [];
    let usernameUpdateOk: boolean = true;
    let avatarUpdateOk: boolean = true;
    let passwordUpdateOk: boolean = true;

    if (username.value.length > 0)
        usernameUpdateOk = await user.updateUsername(username.value);
    if (avatarImage.value)
        avatarUpdateOk = await user.updateAvatar(avatarImage.value);
    if (password.value.length > 0)
        passwordUpdateOk = await user.updatePassword(password.value);

    if (!usernameUpdateOk || !avatarUpdateOk || !passwordUpdateOk) {
        if (!usernameUpdateOk)
            message.value.push("error while updating username");
        if (!avatarUpdateOk)
            message.value.push("error while updating avatar");
        if (!passwordUpdateOk)
            message.value.push("error while updating password");
        return;
    }
    editModeOff();
}

onBeforeMount(async () => {
    userData.value = await user.fetchUserData();
})

</script>

<template>

	<h1>hola, this is {{ user.username }}'s profile</h1>
    <button class="edit-button" v-if="!editMode" @click="editModeOn">EDIT PROFILE (avatar/username/password)</button>
    <div v-else>
        <button class="edit-button" @click="saveChanges">SAVE CHANGES</button>
        <button class="edit-button" @click="editModeOff">CANCEL</button>
        <div class="error-message" v-if="message.length > 0">
            {{ message }}
        </div>
    </div>
    <div class="user-info">
        <div class="section">
            <h2>Avatar</h2>
            <div class="avatar-section">
                <img id="user-image" :src="user.avatarImageURL" />
                <input v-if="editMode" type="file" accept="image/jpeg" @change="loadAvatarPreview"/>
            </div>
            <div v-if="editMode">
                <div v-if="cropperImg">
                    <AvatarCropper :avatar-url="cropperImg" @crop="updateAvatar" class="image-cropper" />
                    <button @click="cancelAvatarPreview">cancel</button>
                </div>
                <p>Preview:</p>
                <img :src="imagePreview" class="image-preview"/>
            </div>
        </div>
        <div class="section">
            <h2>Username</h2>
            <p>Username: {{ user.username }}</p>
            <div v-if="editMode">
                <label>new username: </label>
                <input type="text" v-model="username"/>
            </div>
        </div>
        <div class="section">
            <h2>Password</h2>
            <div v-if="editMode">
                <label>new password: </label>
                <input type="text" v-model="password"/>
            </div>
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
    .edit-button {
        margin-left: 20px;
    }
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

    .image-preview {
        width: 100px;
        display: block;
        margin: 20px;
    }

</style>
