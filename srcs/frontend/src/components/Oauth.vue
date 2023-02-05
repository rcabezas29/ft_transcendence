<script setup lang="ts">
import router from '@/router';
import { user } from '@/user';
import { onBeforeMount, ref } from 'vue';

const username = ref("");
const errorMessage = ref("");

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
		errorMessage.value = response;
		return;
	}
	user.auth(response.access_token);
	router.replace({ "name": "home"});
});

</script>

<template>
	oauth component!
	<div class="error-message">{{ errorMessage }}</div>
	please wait while you're being logged in, you will be redirected in a few moments...
</template>

<style scoped>
	.error-message {
		color: red;
	}
</style>