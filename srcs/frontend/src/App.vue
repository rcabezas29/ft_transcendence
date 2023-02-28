<script setup lang="ts">
	import "./assets/main.css"
	import { user } from "./user";
	import router from './router';
	import AlreadyConnected from './views/AlreadyConnected.vue'
	import { computed } from "vue";
	import CursorLines from './components/CursorLines.vue'

	const routes = router.getRoutes();
		
	const userImg = computed(() => {
		if (user.username)
			return `http://localhost:3000/users/avatar/${user.username}`;
		else
			return "";
	});

	function logoutUser(): void {
		user.logout();
		router.replace({ "name": "login" });
	}

</script>

<template>
		<CursorLines/>

	<h1>FT_TRANSCENDENCE</h1>

	<div v-if="user.alreadyConnected"> 
		<AlreadyConnected/>
	</div>
	<div v-else>
		<div class="dev">
			<h3>Dev data</h3>
			<div v-if="user.isLogged()">
				<div class="user-img">
					<img :src="userImg" />
				</div>
				<h4>User: {{ user.username }}</h4>
				<p>isLogged: {{ user.isLogged() }}</p>
				<p>token: {{ user.token }}</p>
				<p>socketId: {{ user.socketId }}</p>
			</div>
		
			<h4>Navigation</h4>
			<div class="dev-links" v-for="route in routes">
				<div>
					<router-link :to="route.path">{{ route.name }}</router-link>
				</div>
			</div>
			<button @click="logoutUser" v-if="user.isLogged()">Logout</button>
		</div>

		<router-view/>
	</div>
	
</template>

<style scoped>

	

	.dev {
		border: 1px solid black;
	}

	.dev-links {
		display: flex;
	}

	.dev-links div {
		margin-right: 10px;
	}

	.user-img img {
		height: 100px;
		width: 100px;
	}

</style>