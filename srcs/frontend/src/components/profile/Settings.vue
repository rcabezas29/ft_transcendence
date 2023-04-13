<script setup lang="ts">
	import { onBeforeMount, type Ref, ref, computed } from "vue";
	import { user } from "../../user";
	import Button from "../ui/Button.vue";
	import TextInputField from "../ui/TextInputField.vue";
	import type { UserData } from "@/interfaces";
	import AvatarCropper from "../AvatarCropper.vue";
    import FileUploadButton from "../ui/FileUploadButton.vue";

	const userData: Ref<UserData | null> = ref(null);
	const editMode: Ref<boolean> = ref(false);
	const usernameInput: Ref<string> = ref("");
	const passwordInput: Ref<string> = ref("");
	const errorMessage: Ref<string[]> = ref([]);

	const cropperImgURL = ref<string>(user.avatarImageURL);
    const avatarImageURL = ref<string>(user.avatarImageURL);
    const croppedAvatarImage = ref<Blob | null>(null);
    const imagePreviewURL = computed(() => {
        if (croppedAvatarImage.value)
            return URL.createObjectURL(croppedAvatarImage.value);
        return user.avatarImageURL;
    })

	onBeforeMount(async () => {
		userData.value = await user.fetchUserData();
	})	

	function startEditProfile() {
		editMode.value = true;
	}
	
	function stopEditProfile() {
		usernameInput.value = "";
		passwordInput.value = "";
		croppedAvatarImage.value = null;
		cropperImgURL.value = user.avatarImageURL;
    	avatarImageURL.value = user.avatarImageURL;
		errorMessage.value = [];
		editMode.value = false;
	}

	async function saveProfileChanges() {
		errorMessage.value = [];
		let usernameUpdated: boolean = true;
		let avatarUpdated: boolean = true;
		let passwordUpdated: boolean = true;

		if (usernameInput.value.length > 0)
			usernameUpdated = await user.updateUsername(usernameInput.value);
		if (croppedAvatarImage.value)
			avatarUpdated = await user.updateAvatar(croppedAvatarImage.value);
		if (passwordInput.value.length > 0)
			passwordUpdated = await user.updatePassword(passwordInput.value);

		if (usernameUpdated)
			user.notifyOfUserChange();

		if (!usernameUpdated || !avatarUpdated || !passwordUpdated) {
			if (!usernameUpdated)
				errorMessage.value.push("error while updating username");
			if (!avatarUpdated)
				errorMessage.value.push("error while updating avatar");
			if (!passwordUpdated)
				errorMessage.value.push("error while updating password");
			return;
		}
		stopEditProfile();
		userData.value = await user.fetchUserData();
	}

	const cropperVisible = ref<boolean>(false);
    function openCropper() {
		if (editMode.value)
			cropperVisible.value = true;
	}

    function closeCropper() {
		cropperVisible.value = false;
	}

	function loadImage(imageBlob: Blob) {
        const reader = new FileReader();
        reader.onload = function(event) {
            if (!event.target || !event.target.result)
                return;
            cropperImgURL.value = event.target.result.toString();
            openCropper();
        };
        reader.readAsDataURL(imageBlob);
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
	<div class="container">
		<div class="header">
			<div class="header-image">
				<img :src="imagePreviewURL" @click="openCropper" alt="" srcset="">
			</div>
			<div class="header-buttons">
				<Button v-if="!editMode" @click="startEditProfile">EDIT PROFILE</Button>
				<Button v-if="!editMode" :selected="userData?.isTwoFactorAuthenticationEnabled">
					{{ userData?.isTwoFactorAuthenticationEnabled ? "2FA ENABLED" : "2FA DISABLED"}}
				</Button>

				<div class="header-editing-buttons">
					<Button v-if="editMode" @click="saveProfileChanges">SAVE</Button>
					<Button v-if="editMode" @click="stopEditProfile">CANCEL</Button>
				</div>
				<div class="avatar-section" v-if="editMode">
					<AvatarCropper v-if="cropperImgURL && cropperVisible" :visible="cropperVisible" :avatar-url="cropperImgURL" @cancel="cancelCropper" @crop="updateAvatar"/>
					<FileUploadButton bg-color="#1E9052" @new-file="loadImage"/>
				</div>
			</div>
		</div>
		<div>
			<span class="error-message" v-if="errorMessage.length > 0">{{ errorMessage }}</span>
		</div>
		<div class="form">
			<TextInputField v-if="!editMode" placeholder-text="USERNAME" :modelValue="userData?.username" readonly/>
			<TextInputField v-if="editMode" v-model="usernameInput" placeholder-text="NEW USERNAME" />

			<TextInputField v-if="!editMode" placeholder-text="INTRA USERNAME" :modelValue="userData?.intraUsername" readonly/>
			<TextInputField v-if="!editMode" placeholder-text="EMAIL" :modelValue="userData?.email" readonly/>

			<TextInputField v-if="editMode" v-model="passwordInput" placeholder-text="NEW PASSWORD" />

		</div>
	</div>
</template>

<style scoped>

	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.header {
		box-sizing: border-box;
		width: 100%;
		display: flex;
		/*flex-direction: column;*/
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.header-image {
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		width: 50%;
	}

	.header-image img {
		box-sizing: border-box;
		border: 4px solid #1E9052;
        padding: 8px;
		width: 100%;
	}

	.header-buttons {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		width: 50%;
		height: 100%;
		justify-content: space-between;
		align-items: space-between;
		gap: 10px;
		/*margin-top: 20px;*/

	}

	.header-buttons button {
		padding: 10px 20px;
	}

	.header-editing-buttons {
		display: flex;
		flex-direction: column;
	}

	.header-editing-buttons > * {
		width: 100%;
	}

	.avatar-section {
        display: flex;
        /*width: 40%;*/
    }

	.avatar-section input[type="file"]::file-selector-button {
		padding: 10px 20px;
	}

	.form {
		margin-top: 30px;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.header {
			flex-direction: row;
			justify-content: left;
		}

		.header-buttons {
			margin: 0;
			margin-left: 20px;
			width: 300px;
		}

		.header-editing-buttons {
			flex-direction: row;
		}

		.header-image {
			justify-content: flex-start;
			width: 150px;
			height: 150px;
		}
	}

</style>
