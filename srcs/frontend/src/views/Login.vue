<script setup lang="ts">
	import router from "../router";
	import { ref } from "vue"
	import { user } from "../user";

	const email = ref("");
	const password = ref("");
	const message = ref("");
	const messageClass = ref("error-message");

	async function handleSubmit(e: Event) {
		const { loggedSuccessfully, response } = await user.login(email.value, password.value);
		if (!loggedSuccessfully)
		{
			message.value = response.message;
			return;
		}

		await user.auth(response.access_token);

		if (await user.checkIfSecondFactorAuthenticationIsNeeded(response.access_token)){
			router.replace({ "name": "2fa-auth" });
			return;
		}

		message.value = "Success";
		messageClass.value = "success-message";

		router.replace({ "name": "home"});
	}

	function loginWithIntra() {
		user.loginWithIntra();
	}

</script>

<template>
	<form @submit.prevent="handleSubmit">
		<label>Email: </label>
		<input type="text" v-model="email"/>
		<br/>
		<label>Password: </label>
		<input type="password" v-model="password"/>
		<br/>
		<label :class="messageClass">{{ message }}</label>
		<br/>
		<button>Login</button>
	</form>
	<div class="login-42-button">
		<button @click="loginWithIntra">Or login with 42</button>
	</div>
</template>

<style scoped>
	.error-message {
		color: red;
	}

	.success-message {
		color: green;
	}

	.login-42-button {
		margin-top: 10px;
	}

	.login-42-button > button {
		background-color: #44dacb;
	}
</style>