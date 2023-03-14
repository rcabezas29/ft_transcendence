<script setup lang="ts">
import router from '@/router';
import { user } from '@/user';
import { onBeforeMount } from 'vue';

interface OauthResponse {
	access_token: string;
	isFirstLogin: boolean;
}

onBeforeMount(async () => {
	const params = new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");
	if (!code || !state) {
		router.replace({ "name": "login" })
		return;
	}

	const searchParams: URLSearchParams = new URLSearchParams();
	searchParams.append('code', code);
	searchParams.append('state', state);

	const httpResponse = await fetch('http://localhost:3000/auth/oauth?' + searchParams);
	if (httpResponse.status != 200) {
		router.replace({ "name": "login" })
		return;
	}
	const response: OauthResponse = await httpResponse.json();

	await user.auth(response.access_token);

	if (await user.checkIfSecondFactorAuthenticationIsNeeded(response.access_token)){
		router.replace({ "name": "2fa-auth" });
		return;
	}

	if (response.isFirstLogin || user.hasSubmittedFirstTimeLoginForm() === false)
		router.replace({ "name": "first-login" });
	else
		router.replace({ "name": "home" });
});

</script>

<template>
	please wait while you're being logged in, you will be redirected in a few moments...
</template>

<style scoped>
</style>