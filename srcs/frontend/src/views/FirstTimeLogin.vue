<script setup lang="ts">
    import router from "@/router";
    import { computed, ref } from "vue"
    import { user } from "../user";
    import AvatarCropper from '../components/AvatarCropper.vue';
	import Button from "../components/ui/Button.vue";

    const username = ref("");
    const intraAvatarURL: string = `http://localhost:3000/users/avatar/${user.id}`;

    const cropperImgURL = ref<string>(intraAvatarURL);
    const avatarImageURL = ref<string>(intraAvatarURL);
    const croppedAvatarImage = ref<Blob | null>(null);
    const imagePreviewURL = computed(() => {
        if (croppedAvatarImage.value)
            return URL.createObjectURL(croppedAvatarImage.value);
        return intraAvatarURL;
    })
    
    const errorMessage = ref("");

    const cropperVisible = ref<boolean>(false);
    function openCropper() {
		cropperVisible.value = true;
	}

    function closeCropper() {
		cropperVisible.value = false;
	}

    async function handleSubmit() {
        if (!username.value || !croppedAvatarImage.value) {
            errorMessage.value = "missing info! please check that you have filled all sections";
            return;
        }

        const usernameUpdated = await user.updateUsername(username.value);
        if (usernameUpdated === false) {
            errorMessage.value = "error while updating username";
            return;
        }

        const avatarUpdated = await user.updateAvatar(croppedAvatarImage.value);
        if (avatarUpdated === false) {
            errorMessage.value = "error while updating avatar";
            return;
        }

        router.replace({ "name": "home"});
    }

    function loadImage(e: any) {
        const image: Blob = e.target.files[0];
        if (!image)
            return;

        const reader = new FileReader();
        reader.onload = function(event) {
            if (!event.target || !event.target.result)
                return;
            cropperImgURL.value = event.target.result.toString();
            openCropper();
        };
        reader.readAsDataURL(image);
    }

    function updateAvatar(imageBlob: Blob) {
        avatarImageURL.value = cropperImgURL.value;
        croppedAvatarImage.value = imageBlob;
		closeCropper();
    }

    function cancelCropper() {
        cropperImgURL.value = avatarImageURL.value;
		closeCropper();
    }

</script>

<template>
	<div class="form-container">
		<div class="form-header">
			<span>WELCOME TO PONGHUB!</span>
		</div>
		<form @submit.prevent="handleSubmit">
		    <p>Since this is your first time...</p>
			<label>Choose a display username:</label>
            <div class="username-section">
			    <input type="text" v-model="username" placeholder="$> DISPLAY USERNAME..."/>
            </div>
			
			<label>Crop your avatar image or upload a new one:</label>
            <div class="avatar-section">
        	    <img :src="imagePreviewURL" class="image-preview"/>
                <div class="avatar-section-buttons">
                    <Button type="button" @click="openCropper">CROP THIS IMAGE</Button>
                    <AvatarCropper v-if="cropperImgURL && cropperVisible" :visible="cropperVisible" :avatar-url="cropperImgURL" @cancel="cancelCropper" @crop="updateAvatar"/>
                    <input type="file" id="fileUpload" accept="image/jpeg" @change="loadImage"/>
                </div>
            </div>
			
			<div class="error-message">{{ errorMessage }}</div>
			<Button :selected="true" type="submit">DONE!</button>
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
        display: flex;
        flex-direction: column;
	}

    label {
        margin-bottom: 10px;
    }

	.username-section > input {
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

    .avatar-section {
        align-self: center;
        display: flex;
        justify-content: space-between;
        width: 70%;
        margin-bottom: 40px;
    }

    .avatar-section-buttons {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 45%;
    }

    .avatar-section-buttons > button {
		padding: 20px 20px;
        margin: 20px 0px;
    }

    input[type="file"]::file-selector-button {
        cursor: pointer;
		background-color: #08150C;
		border: 4px solid #4BFE65;
		color: #B3F9D7;
		font-family: vp-pixel;
		padding: 20px 20px;
		width: 100%;
		max-height: 66px;
    }

    input[type="file"]::file-selector-button:hover {
        background-color: #4BFE65;
		color: #08150C;
    }

    .image-preview {
        width: 45%;
        display: block;
        border: 4px solid #1E9052;
        padding: 8px;
    }
</style>