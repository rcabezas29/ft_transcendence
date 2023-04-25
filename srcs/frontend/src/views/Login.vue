<script setup lang="ts">
	import router from "../router";
	import { ref } from "vue"
	import { user } from "../user";
	import Button from "../components/ui/Button.vue";
	import TextInputField from "../components/ui/TextInputField.vue";

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

		const authOk = await user.auth(response.access_token);
		if (!authOk) {
			message.value = "Something went wrong";
			return;
		}

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
			<TextInputField v-model="email" placeholder-text="EMAIL"/>
			<TextInputField type="password" v-model="password" placeholder-text="PASSWORD"/>
			<div :class="messageClass">{{ message }}</div>
			<div class="form-buttons">
				<Button type="button" @click="moveToRegister">REGISTER</Button>
				<Button type="submit" :selected="true">LOGIN</Button>
			</div>
			<Button type="button" @click="loginWithIntra" class="button-42">
				<div class="login-text">
					LOGIN WITH
					<img src="../assets/42Logo.svg" alt="42Logo"  width="22" height="22">
					INTRA
				</div>
			</Button>
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
		flex-direction: column;
		gap: 14px
	}

	.button-42 {
		margin-top: 14px;
		background-color: #04809F;
		border: none;
		padding: 20px 30px;
	}

	form {
		padding: 32px;
	}

	input {
        margin-bottom: 14px;
	}

	.login-text {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.login-text img {
		margin: 0px 8px;
	}

	.error-message {
		color: red;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.form-buttons {
			flex-direction: row;
		}
	}
</style>