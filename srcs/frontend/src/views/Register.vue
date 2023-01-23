<script setup lang="ts">
	import { ref } from "vue"
	import { user } from "../user";

	const username = ref("");
	const email = ref("");
	const password = ref("");
	const message = ref("");
	const messageClass = ref("error-message");

	async function handleSubmit(e: Event) {

		const createUser = {
			username: username.value,
			email: email.value,
			password: password.value
		};

		const httpResponse = await fetch("http://localhost:3000/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(createUser)
		});

		const response = await httpResponse.json();
		
		if (httpResponse.status != 201) {
			message.value = response.message;
			return;
		}
			
		user.auth(response.access_token);
		message.value = "Success";
		messageClass.value = "success-message";

	}
	
</script>

<template>
	<form @submit.prevent="handleSubmit">
		<label>Username: </label>
		<input type="text" v-model="username"/>
		<br/>
		<label>Email: </label>
		<input type="email" v-model="email"/>
		<br/>
		<label>Password: </label>
		<input type="password" v-model="password"/>
		<br/>
		<label :class="messageClass">{{ message }}</label>
		<br/>
		<button>Register</button>
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