<script setup lang="ts">
	import { onMounted, onUnmounted, ref, type Ref } from 'vue';
	import { useRoute } from 'vue-router';
	import { gameController } from '../gameController';
	import { user } from "../user"
	import router from "../router"
	import Button from '@/components/ui/Button.vue';
	import GameBoard from '@/components/ui/GameBoard.vue';
	import ScoreBoard from '@/components/ScoreBoard.vue';

	interface GamePlayers {
		player1: string;
		player2: string;
	}

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
		user.socket?.on("spectate-game-players", setPlayers);
		user.socket?.emit("spectate-game", matchId.value);

		gameController.initCanvas(canvasRef.value!.getContext("2d")!);
	})

	function spectate(gameExists: boolean) {
		if (!gameExists) {
			router.push("/game")
			return
		}

	}

	function setPlayers(players: GamePlayers) {
		console.log("set players")
		gameController.scoreBoard.user1Name = players.player1
		gameController.scoreBoard.user2Name = players.player2
	}

	function leaveGame() {
		user.socket?.emit("spectate-leave", matchId.value);
		router.push("/game")
		console.log("entra");
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
