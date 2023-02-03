<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

const message = ref("");
const messageClass = ref("error-message");

onBeforeMount(async () => {
	const params = new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");
	if (!code || !state)
		return;

	const searchParams: URLSearchParams = new URLSearchParams();
	searchParams.append('code', code);
	searchParams.append('state', state);

	const httpResponse = await fetch('http://localhost:3000/auth/oauth?' + searchParams);
	const response = await httpResponse.json();

	if (httpResponse.status != 200)
	{
		message.value = response;
		return;
	}
		
	message.value = "success!"
	messageClass.value = "success-message"
});
	
</script>

<template>
	oauth component!
	<div :class="messageClass">{{ message }}</div>
</template>

<style scoped>
	.error-message {
		color: red;
	}

	.success-message {
		color: green;
	}
</style>