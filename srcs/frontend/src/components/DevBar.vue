<script setup lang="ts">
	import { ref } from "vue";
	import { user } from "../user";
	import router from '../router';

	const routes = router.getRoutes();

	function logoutUser(): void {
		user.logout();
		router.replace({ "name": "login" });
	}

	const devPanelHidden = ref(true);

	function toggleDevPavel() {
		devPanelHidden.value = !devPanelHidden.value;
	}
</script>

<template>
	<!-- DEV START-->
	<div class="dev">
			<div class="dev-bar" @click="toggleDevPavel">DEV PANEL - CLICK TO OPEN</div>
			<div :class="{ hidden: devPanelHidden}">
				<div v-if="user.checkIsLogged()">
					<img id="user-image" :src=user.avatarImageURL />
					<h4>User: {{ user.username }}</h4>
					<p>isLogged: {{ user.checkIsLogged() }}</p>
					<p>token: {{ user.token }}</p>
					<p>socketId: {{ user.socketId }}</p>
				</div>
			
				<h4>Navigation</h4>
				<div class="dev-links" v-for="route in routes">
					<div>
						<router-link :to="route.path">{{ route.name }}</router-link>
					</div>
				</div>
				<button @click="logoutUser" v-if="user.checkIsLogged()">Logout</button>
			</div>
		</div>
		<!-- DEV END-->
</template>

<style scoped>
		
	.dev {
		border: 1px solid black;
	}

	.dev-bar {
		background-color: Gray;
		width: 100%;
	}

	.dev-links {
		display: flex;
	}

	.dev-links div {
		margin-right: 10px;
	}

	.hidden {
		display: none;
	}

	#user-image {
		display: block;
		width: 100px;
		height: 100px;
	}

</style>