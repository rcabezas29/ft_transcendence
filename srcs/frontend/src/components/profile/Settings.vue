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
	const errorMessage: Ref<string> = ref("");
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
	
	function cancelEditProfile() {
		editMode.value = false;
	}

	async function saveProfileChanges() {

		if (usernameInput.value.length < 3 ) {
			errorMessage.value = "Username must be longer than 2 characters";
			return; 
		}

		const usernameUpdated: boolean = await user.updateUsername(usernameInput.value);

		console.log(usernameUpdated);

		if (!usernameUpdated)
		{
			errorMessage.value = "Username already exists";
			return;
		}

		errorMessage.value = "";
		editMode.value = false;

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
					<Button v-if="editMode" @click="cancelEditProfile">CANCEL</Button>
				</div>
				<Button v-if="editMode" @click="cancelEditProfile">CHANGE PROFILE PICTURE</Button>
			</div>
		</div>
		<div>
			<span class="error-message">{{ errorMessage }}</span>
		</div>
		<div class="form">
			<TextInputField v-if="!editMode" placeholder-text="USERNAME" :modelValue="userData?.username" readonly/>
			<TextInputField v-if="editMode" v-model="usernameInput" placeholder-text="NEW USERNAME" />

			<TextInputField v-if="!editMode" vplaceholder-text="INTRA USERNAME" :modelValue="userData?.intraUsername" readonly/>
			<TextInputField v-if="!editMode" placeholder-text="EMAIL" :modelValue="userData?.email" readonly/>
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
