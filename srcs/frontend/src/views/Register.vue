<script setup lang="ts">
	import router from "@/router";
	import { ref } from "vue"
	import { user } from "../user";
	import Button from "../components/ui/Button.vue";
	import TextInputField from "../components/ui/TextInputField.vue";

	const username = ref("");
	const email = ref("");
	const password = ref("");
	const message = ref("");
	const messageClass = ref("error-message");

	async function handleSubmit(e: Event) {
		const { registeredSuccessfully, response } = await user.register(username.value, email.value, password.value);
	
		if (!registeredSuccessfully) {
			message.value = response.message;
			return;
		}

		const loginRet = await user.login(email.value, password.value);
		if (!loginRet.loggedSuccessfully)
		{
			message.value = loginRet.response.message;
			return;
		}

		const accessToken = loginRet.response.access_token;

		user.auth(accessToken);
		message.value = "Success";
		messageClass.value = "success-message";
		router.replace({ "name": "home"});
	}

	function loginWithIntra() {
		user.loginWithIntra();
	}

	function moveToLogin() {
		router.push("login")
	}
	
</script>

<template>
	<div class="form-container">
		<div class="form-header">
			<span>REGISTER</span>
		</div>
		<form @submit.prevent="handleSubmit">
			<TextInputField v-model="username" placeholder-text="USERNAME"/>
			<TextInputField v-model="email" placeholder-text="EMAIL"/>
			<TextInputField type="password" v-model="password" placeholder-text="PASSWORD"/>

			<label :class="messageClass">{{ message }}</label>
			<div class="form-buttons">
				<Button type="button" @click="moveToLogin">LOGIN</Button>
				<Button type="submit" :selected="true" @click="handleSubmit">REGISTER</Button>
			</div>
			<Button type="button" @click="loginWithIntra" class="button-42">REGISTER WITH 42 INTRA</Button>
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
		margin-bottom: 14px;
	}
</style>