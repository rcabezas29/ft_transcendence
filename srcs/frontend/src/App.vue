<script setup lang="ts">
	import { ref } from "vue";
	import "./assets/main.css";
	import { user } from "./user";
	import router from './router';
	import AlreadyConnected from './views/AlreadyConnected.vue';
	import CursorLines from './components/CursorLines.vue';

	const routes = router.getRoutes();

	function logoutUser(): void {
		user.logout();
		router.replace({ "name": "login" });
	}

	const devPanelHidden = ref(true);

	function toggleDevPavel() {
		devPanelHidden.value = !devPanelHidden.value;
		console.log("click");
	}
</script>

<template>
	<div v-if="user.alreadyConnected"> 
		<AlreadyConnected/>
	</div>
	<div v-else>
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

		<router-view/>
	</div>
	
</template>

<style scoped>

	.dev {
		border: 1px solid black;
	}

	.dev-bar {
		background-color: grey;
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