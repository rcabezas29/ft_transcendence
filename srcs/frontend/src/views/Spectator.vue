<script setup lang="ts">
	import { onMounted, onUnmounted, ref, type Ref } from 'vue';
	import { useRoute } from 'vue-router';
	import { gameController } from '../gameController';
	import { user } from "../user"
	import router from "../router"

	const route = useRoute();
	const matchId: Ref<string> = ref<string>("");
	const canvasRef = ref<HTMLCanvasElement>();

	onMounted(() => {
		console.log(route.params)
		const id: string = route.params.matchId as string;
		console.log("ID: ", id);
		matchId.value = id

		console.log("Mounted with matchId: ", matchId.value)

		user.socket?.on("spectate-game", spectate);
		user.socket?.emit("spectate-game", matchId.value);

		gameController.initCanvas(canvasRef.value!.getContext("2d")!);
	})

	onUnmounted(() => {
		//TODO: delete spectate-game event handler
	})

	function spectate(gameExists: boolean) {
		console.log("Spectator view: ", gameExists);
		
		if (!gameExists) {
			router.push("index")
			return
		}

	}

</script>

<template>
	<h1>Spectator view | Match id: {{ matchId }}</h1>

	<canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
</template>

<style scoped>

</style>
