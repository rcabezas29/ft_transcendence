<script setup lang="ts">
    import router from "@/router";
    import { computed, ref } from "vue"
    import { user } from "../user";
    import AvatarCropper from '../components/AvatarCropper.vue';

    const avatarURL: string = `http://localhost:3000/users/avatar/${user.id}`;
    const cropperImg = ref<string | ArrayBuffer | null >(avatarURL);
    const username = ref("");
    const avatarImage = ref<Blob | null>(null);
    const imagePreview = computed(() => {
        if (avatarImage.value)
            return URL.createObjectURL(avatarImage.value);
        return "";
    })
    
    const errorMessage = ref("");

    async function handleSubmit() {
        if (!username.value || !avatarImage.value) {
            errorMessage.value = "missing info! please check that you have filled all sections";
            return;
        }

        const userUpdated = await user.updateUsername(username.value);
        if (userUpdated === false) {
            errorMessage.value = "error while updating username";
            return;
        }

        const avatarUpdated = await user.updateAvatar(avatarImage.value);
        if (avatarUpdated === false) {
                errorMessage.value = "error while updating avatar";
                return;
        }

        router.replace({ "name": "home"});
    }

    function loadAvatarPreview(e: any) {
        const image: Blob = e.target.files[0];
        if (!image)
            return;

        const reader = new FileReader();
        reader.onload = function(event) {
            if (!event.target)
                return;
            cropperImg.value = event.target.result;
        };
        reader.readAsDataURL(image);
    }

    function updateAvatar(imageBlob: Blob) {
        avatarImage.value = imageBlob;
    }

</script>

<template>
    <h1>Welcome! Since this is your first time...</h1>
    <form @submit.prevent="handleSubmit">
        <label>Choose a display username: </label>
        <input type="text" v-model="username"/>
        <br/>

        <p>crop your photo or upload a new one</p>
        <AvatarCropper v-if="cropperImg" :avatar-url="cropperImg as string" @crop="updateAvatar" class="image-cropper" />
        <input type="file" accept="image/jpeg" @change="loadAvatarPreview"/>

        <p>Preview:</p>
        <img :src="imagePreview" class="image-preview"/>


        <label class="error-message">{{ errorMessage }}</label>
        <br/>
        <button>Submit</button>
    </form>
</template>

<style scoped>
    .error-message {
        color: red;
    }

    .image-preview {
        width: 100px;
        display: block;
        margin: 20px;
    }

    form {
        margin-bottom: 20px;
    }
</style>