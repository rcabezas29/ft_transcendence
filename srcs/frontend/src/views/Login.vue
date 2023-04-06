<script setup lang="ts">
	import router from "../router";
	import { ref } from "vue"
	import { user } from "../user";
	import Button from "../components/ui/Button.vue"

	const email = ref("");
	const password = ref("");
	const message = ref("");
	const messageClass = ref("error-message");

	async function handleSubmit(e: Event) {
		const { loggedSuccessfully, response } = await user.login(email.value, password.value);
		if (!loggedSuccessfully) {
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

	function moveToRegister() {
		router.push("register")
	}

</script>

<template>
	<div class="form-container">
		<div class="form-header">
			<span>LOGIN</span>
		</div>
		<form @submit.prevent="handleSubmit">
			<input type="text" v-model="email" placeholder="email"/>
			<input type="password" v-model="password" placeholder="password"/>
			<div :class="messageClass">{{ message }}</div>
			<div class="form-buttons">
				<Button @click="moveToRegister">REGISTER</Button>
				<Button :selected="true" @click="handleSubmit">LOGIN</Button>
			</div>
			<Button @click="loginWithIntra" class="button-42">LOG WITH 42 INTRA</Button>
		</form>
	</div>
</template>

<style scoped>

	.form-container {
		max-width: 700px;
		margin: auto;
		margin-top: 34px;
		border: 4px solid #4BFE65;
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

	.form-buttons {
		display: flex;
		gap: 24px
	}

	.button-42 {
		margin-top: 14px;
		background-color: #04809F;
		border: none;
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
</style>