<script setup lang="ts">
	import router from "../router";
	import { ref } from "vue"
	import { user } from "../user";

	const email = ref("");
	const password = ref("");
	const message = ref("");
	const messageClass = ref("error-message");

	async function handleSubmit(e: Event) {

		const loginUser = {
			email: email.value,
			password: password.value
		};

		const httpResponse = await fetch("http://localhost:3000/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(loginUser)
		});

		const response = await httpResponse.json();
		
		if (httpResponse.status != 201) {
			message.value = response.message;
			return;
		}
			
		user.auth(response.access_token);
		message.value = "Success";
		messageClass.value = "success-message";

		router.replace({ "name": "home"});
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
</template>

<style scoped>
	.error-message {
		color: red;
	}

	.success-message {
		color: green;
	}
</style>