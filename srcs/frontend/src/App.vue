<script setup lang="ts">
	import "./assets/main.css";
	import { user } from "./user";
	import AlreadyConnected from './views/AlreadyConnected.vue';
	import Chat from "./views/Chat.vue";
	import NavBar from './components/NavBar.vue';
	import DevBar from "./components/DevBar.vue";
	import Alert from "./components/ui/Alert.vue";
	import { alertController } from "./alertController";

</script>

<template>
	<div v-if="user.alreadyConnected"> 
		<AlreadyConnected/>
	</div>
	<div v-else>
		<DevBar/>
		<div class="app-container">
			<NavBar v-if="user.checkIsLogged() && user.hasSubmittedFirstTimeLoginForm()"/>
			<div class="app-body">
				<router-view/>
			</div>
			<Chat v-if="user.checkIsLogged() && user.hasSubmittedFirstTimeLoginForm()"/>
		</div>
		<Alert :visible="alertController.active" :message="alertController.message"/>
	</div>
	
</template>

<style scoped>

	.app-container {
		box-sizing: border-box;
		max-width: 1200px;
		padding: 24px 24px;
		margin: auto;
		box-sizing: border-box;
		height: 100vh;
	}

	.app-body {
		padding-top: 24px;
		box-sizing: border-box;
		height: 80%;
		max-height: 80%;
	}


</style>