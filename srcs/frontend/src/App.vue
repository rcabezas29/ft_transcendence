<script setup lang="ts">
	import "./assets/main.css";
	import { user } from "./user";
	import AlreadyConnected from './views/AlreadyConnected.vue';
	import Chat from "./views/Chat.vue"
	import NavBar from './components/NavBar.vue'
	import DevBar from "./components/DevBar.vue";
</script>

<template>
	<div v-if="user.alreadyConnected"> 
		<AlreadyConnected/>
	</div>
	<div v-else>
		<DevBar/>
		<div class="app-container">
			<NavBar v-if="user.checkIsLogged()"/>
			<div class="app-body">
				<router-view/>
			</div>
			<Chat v-if="user.checkIsLogged()"/>
		</div>
	</div>
	
</template>

<style scoped>

	.app-container {
		box-sizing: border-box;
		max-width: 1200px;
		padding: 24px 24px;
		margin: auto;
		box-sizing: border-box;
	}

	.app-body {
		padding-top: 24px;
		box-sizing: border-box;
	}


</style>