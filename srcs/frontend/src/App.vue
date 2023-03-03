<script setup lang="ts">
	import Cropper from 'cropperjs';
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


	function onclick() {
		const image = document.getElementById('image') as HTMLImageElement | null;
		if (!image)
			return;

		const cropper = new Cropper(image, {
			template:
				"<cropper-canvas style=\"min-width: 200px; min-height: 200px;\" background>\
					<cropper-image></cropper-image>\
					<cropper-shade hidden></cropper-shade>\
					<cropper-handle action=\"select\" plain></cropper-handle>\
					<cropper-selection aspect-ratio=\"1\" initial-coverage=\"1\" movable resizable zoomable>\
						<cropper-grid role=\"grid\" bordered covered></cropper-grid>\
						<cropper-crosshair centered></cropper-crosshair>\
						<cropper-handle action=\"move\" theme-color=\"rgba(255, 255, 255, 0.35)\"></cropper-handle>\
						<cropper-handle action=\"n-resize\"></cropper-handle>\
						<cropper-handle action=\"e-resize\"></cropper-handle>\
						<cropper-handle action=\"s-resize\"></cropper-handle>\
						<cropper-handle action=\"w-resize\"></cropper-handle>\
						<cropper-handle action=\"ne-resize\"></cropper-handle>\
						<cropper-handle action=\"nw-resize\"></cropper-handle>\
						<cropper-handle action=\"se-resize\"></cropper-handle>\
						<cropper-handle action=\"sw-resize\"></cropper-handle>\
					</cropper-selection>\
				</cropper-canvas>"
		});
	}

	/*

				<div class=\"cropper-viewers\">\
					<cropper-viewer selection=\"#cropperSelection\" style=\"width: 320px;\"></cropper-viewer>\
					<cropper-viewer selection=\"#cropperSelection\" style=\"width: 160px;\"></cropper-viewer>\
					<cropper-viewer selection=\"#cropperSelection\" style=\"width: 80px;\"></cropper-viewer>\
					<cropper-viewer selection=\"#cropperSelection\" style=\"width: 40px;\"></cropper-viewer>\
				</div>
				*/

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
			<div v-if="user.checkIsLogged()">
				<div class="user-img-container">
					<img id="image" :src="userImg" />
				</div>
				<button @click="onclick">CLICK</button>

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

	.user-img-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 300px;
		height: 300px;
		background-color: rgb(255, 204, 0);
	}

	.user-img-container img {
		display: block;
		max-width: 100%;
	}

</style>