<script setup lang="ts">
	import router from "@/router";
	import { ref } from "vue"
	import { user } from "../user";

	const username = ref("");
    const avatarImage = ref<Blob | null>(null);
    const previewImage = ref();
	
    const errorMessage = ref("");

	async function handleSubmit() {

        const userUpdated = await user.updateUsername(username.value);
        if (userUpdated === false) {
            errorMessage.value = "error while updating username";
            return;
        }

       /* const avatarUpdated = await user.updateAvatar()
       if (avatarUpdated === false) {
            errorMessage.value = "error while updating avatar";
            return;
       }

*/

		router.replace({ "name": "home"});
	}
	
</script>

<template>
    <h1>Welcome! Since this is your first time...</h1>
	<form @submit.prevent="handleSubmit">
		<label>Choose a display username: </label>
		<input type="text" v-model="username"/>
		<br/>

        <p>crop or upload a photo</p>

		<label class="error-message">{{ errorMessage }}</label>
		<br/>
		<button>Submit</button>
	</form>
</template>

<style scoped>
	.error-message {
		color: red;
	}
</style>