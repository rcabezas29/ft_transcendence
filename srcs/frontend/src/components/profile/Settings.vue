<script setup lang="ts">
	import { onBeforeMount, type Ref, ref, computed } from "vue";
	import { user } from "../../user";
	import Button from "../ui/Button.vue";
	import TextInputField from "../ui/TextInputField.vue";
	import type { UserData } from "@/interfaces";
	import AvatarCropper from "../AvatarCropper.vue";


	const userData: Ref<UserData | null> = ref(null);
	const editMode: Ref<boolean> = ref(false);
	const usernameInput: Ref<string> = ref("");
	const passwordInput: Ref<string> = ref("");
	const errorMessage: Ref<string[]> = ref([]);
	const cropperImg = ref<string | null>(null);
	const avatarImage = ref<Blob | null>(null);
	const imagePreview = computed(() => {
		if (avatarImage.value)
			return URL.createObjectURL(avatarImage.value);
		return "";
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
		avatarImage.value = null;
		//cancelAvatarPreview();
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
		if (avatarImage.value)
			avatarUpdated = await user.updateAvatar(avatarImage.value);
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

	function updateAvatar(imageBlob: Blob) {
		avatarImage.value = imageBlob;
		cropperImg.value = null;
	}

	function cancelAvatarPreview() {
		cropperImg.value = null;
	}

</script>

<template>
	<div class="container">
		<div class="header">
			<div class="header-image">
				<img :src="user.avatarImageURL" alt="" srcset="">
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
				<Button v-if="editMode" @click="stopEditProfile">CHANGE PROFILE PICTURE</Button>
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

	.header-editing-buttons {
		display: flex;
	}

	.header-editing-buttons > * {
		width: 100%;
	}

	.header-buttons {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		gap: 10px;
		margin-top: 20px;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
		}

		.header-image img {
			width: 150px;
			height: 150px;
		}
	}

</style>
