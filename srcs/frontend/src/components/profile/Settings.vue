<script setup lang="ts">
	import { onBeforeMount, type Ref, ref, computed } from "vue";
	import { user } from "../../user";
	import Button from "../ui/Button.vue";
	import TextInputField from "../ui/TextInputField.vue";
	import type { UserData } from "@/interfaces";
	import AvatarCropper from "../AvatarCropper.vue";
    import FileUploadButton from "../ui/FileUploadButton.vue";
	import router from "@/router";
	import Modal from "../ui/Modal.vue";

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

	async function deleteUserAccount() {
		const httpResponse = await fetch(`http://localhost:3000/users/${user.id}`, {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${user.token}`,
			},
		});

		if (httpResponse.status != 200) {
			console.log("error while deleting user");
			return;
		}
		user.logout();
		router.replace({ "name": "login" });
	}

	let deleteAccountModalVisible = ref<boolean>(false);
	function openDeleteAccountModal() {
		deleteAccountModalVisible.value = true;
	}

	function closeDeleteAccountModal() {
		deleteAccountModalVisible.value = false;
	}

</script>

<template>
	<div class="container">
		<div class="header">
			<div class="header-image">
				<img :src="imagePreviewURL" @click="openCropper" alt="" srcset="">
				<div class="overlay" v-if="editMode">
					<div class="text">CROP THIS PHOTO</div>
				</div>
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

			<Button v-if="editMode" type="button" @click="openDeleteAccountModal" border-color="#EC3F74">DELETE MY ACCOUNT</Button>
			<Modal :visible="deleteAccountModalVisible" @close="closeDeleteAccountModal" title="WARNING">
				<p class="modal-p">
					This action will permanently delete your account on PongHub.
					<br>
					Are you sure you want to continue?
				</p>
				<div class="delete-account-modal-buttons">
					<Button style="width: 30%" @click="deleteUserAccount" border-color="#EC3F74">CONFIRM</Button>
					<Button style="width: 30%" @click="closeDeleteAccountModal">CANCEL</Button>
				</div>
			</Modal>
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
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.header-image {
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		width: 50%;
		position: relative;
	}

	.header-image img {
		box-sizing: border-box;
		border: 4px solid #1E9052;
        padding: 8px;
		width: 100%;
	}

	.overlay {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		opacity: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 12px;
		background-color: #08150C;
	}
	.header-image:hover .overlay {
		opacity: 0.8;
	}

	.header-buttons {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		width: 50%;
		gap: 10px;
	}

	.header-buttons button {
		padding: 10px 20px;
	}

	.header-editing-buttons {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-editing-buttons > * {
		width: 100%;
	}

	.avatar-section {
        display: flex;
    }

	.avatar-section input[type="file"]::file-selector-button {
		padding: 10px 20px;
	}

	.form {
		margin-top: 30px;
	}

	.delete-account-modal-buttons {
		display: flex;
		justify-content: space-around;
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
