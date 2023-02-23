<script setup lang="ts">
import router from '@/router';
import { user } from '@/user';
import { onBeforeMount } from 'vue';

onBeforeMount(async () => {
	const params = new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");
	if (!code || !state)
	{
		router.replace({ "name": "login" })
		return;
	}

	const searchParams: URLSearchParams = new URLSearchParams();
	searchParams.append('code', code);
	searchParams.append('state', state);

	const httpResponse = await fetch('http://localhost:3000/auth/oauth?' + searchParams);
	if (httpResponse.status != 200)
	{
		router.replace({ "name": "login" })
		return;
	}
	const response = await httpResponse.json();

	user.auth(response.access_token);
	router.replace({ "name": "home"});
});

</script>

<template>
	please wait while you're being logged in, you will be redirected in a few moments...
</template>

<style scoped>
</style>