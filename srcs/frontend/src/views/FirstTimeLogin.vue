<script setup lang="ts">
    import router from "@/router";
    import { computed, ref } from "vue"
    import { user } from "../user";
    import AvatarCropper from '../components/AvatarCropper.vue';
	import Button from "../components/ui/Button.vue";

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

        const usernameUpdated = await user.updateUsername(username.value);
        if (usernameUpdated === false) {
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
	<div class="form-container">
		<div class="form-header">
			<span>WELCOME TO PONGHUB!</span>
		</div>
		<p>Since this is your first time...</p>
		<form @submit.prevent="handleSubmit">
			<label>Choose a display username:</label>
			<input type="text" v-model="username" placeholder="$> DISPLAY USERNAME..."/>
			
			<p>Crop your avatar image or upload a new one:</p>
			<AvatarCropper v-if="cropperImg" :avatar-url="cropperImg as string" @crop="updateAvatar" class="image-cropper" />
			<input type="file" accept="image/jpeg" @change="loadAvatarPreview"/>
			
			<p>Preview:</p>
        	<img :src="imagePreview" class="image-preview"/>
			
			<div class="error-message">{{ errorMessage }}</div>
			<Button type="submit">DONE!</button>
		</form>
	</div>
</template>

<style scoped>
	.form-container {
		max-width: 700px;
		margin: auto;
		margin-top: 34px;
		border: 4px solid #4BFE65;
        margin-bottom: 42px;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #1E9052;
		width: 100%;
		font-size: 34px;
		border-bottom: 4px solid #4BFE65;
		padding: 12px;
		box-sizing: border-box;
	}

	form {
		padding: 32px;
	}

	input {
		font-family: vp-pixel;
		color: #B3F9D7;
		border: 1px solid #1E9052;
		background-color: #222035;
		height: 38px;
		width: 100%;
		padding: 0 24px;
		box-sizing: border-box;
		margin-bottom: 14px;
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