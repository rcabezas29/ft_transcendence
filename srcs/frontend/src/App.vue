<script setup lang="ts">
	import { ref } from "vue";
	import "./assets/main.css";
	import { user } from "./user";
	import router from './router';
	import AlreadyConnected from './views/AlreadyConnected.vue';
	import CursorLines from './components/CursorLines.vue';
	import Button from "./components/ui/Button.vue"
	import Chat from "./views/Chat.vue"

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

		<div class="app-container">
			<div class="nav-header">
				<div class="nav-buttons">
					<router-link to="home">
						<Button>PONG.EXE</Button>
					</router-link>

					<router-link to="social">
						<Button>SOCIAL</Button>
					</router-link>

					<router-link to="profile">
						<Button>PROFILE</Button>
					</router-link>
				</div>
				<div class="user-info">
					<div class="user-stats">
						<div>username</div>
						<div>elo: 69</div>
					</div>
					<div class="user-image">
						<img :src=user.avatarImageURL />
					</div>
				</div>
			</div>
			<div class="app-body">
				<router-view/>
			</div>
			<Chat/>
		</div>

	</div>
	
</template>

<style scoped>


	/* DEV STYLE START */
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
	/* DEV STYLE  END*/

	.app-container {
		box-sizing: border-box;
		max-width: 1200px;
		margin: auto;
	}
	
	.nav-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30px;
	}

	.nav-buttons {
		flex: 1;
		display: flex;
		gap: 30px;
		margin-right: 15px;
		max-width: 900px;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.user-stats {
		margin-right: 15px;
	}
	
	.user-image {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4px solid #4BFE65;
		padding: 4px;
	}

</style>