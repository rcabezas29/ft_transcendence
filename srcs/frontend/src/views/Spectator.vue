<script setup lang="ts">
	import { onMounted, onUnmounted, ref, type Ref } from 'vue';
	import { useRoute } from 'vue-router';
	import { gameController } from '../gameController';
	import { user } from "../user"
	import router from "../router"
	import Button from '@/components/ui/Button.vue';
	import GameBoard from '@/components/ui/GameBoard.vue';
	import ScoreBoard from '@/components/ScoreBoard.vue';

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

	function spectate(gameExists: boolean) {
		console.log("Spectator view: ", gameExists);
		
		if (!gameExists) {
			router.push("index")
			return
		}

	}

	function leaveGame() {
		user.socket?.emit("spectate-leave", matchId.value);
		router.replace("/")
	}

</script>

<template>
	<h1>SPECTATING</h1>
	
	<GameBoard>
		<canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
		<ScoreBoard/>
		<Button @click="leaveGame">LEAVE GAME</Button>
	</GameBoard>

</template>

<style scoped>

	.pong-board {
		display: block;
		background-color: black;
	}

</style>
