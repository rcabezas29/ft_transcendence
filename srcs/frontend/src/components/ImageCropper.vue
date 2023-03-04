<script setup lang="ts">
	import Cropper from 'cropperjs';
	import { computed } from "vue";
	import { user } from '@/user';

	const userImg = computed(() => {
		if (user.username)
			return `http://localhost:3000/users/avatar/${user.username}`;
		else
			return "";
	});

	function onclick() {
		const image = document.getElementById('image') as HTMLImageElement | null;
		if (!image)
			return;

		const cropper = new Cropper(image, {
			template:
				"<cropper-canvas style=\"min-width: 250px; min-height: 250px;\" background>\
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
	<div class="user-img-container">
		<img id="image" :src="userImg" />
	</div>
	<button @click="onclick">CLICK</button>
</template>

<style scoped>
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