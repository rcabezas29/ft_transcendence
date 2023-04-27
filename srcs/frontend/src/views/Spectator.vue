<script setup lang="ts">
	import { onMounted, ref, type Ref } from 'vue';
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
		const id: string = route.params.matchId as string;
		matchId.value = id

		user.socket?.on("spectate-game", spectate);
		user.socket?.on("spectate-game-players", setPlayers);
		user.socket?.emit("spectate-game", matchId.value);
		user.socket?.on('spectator-end-game', (winner) => gameEndSpectator(winner));

		gameController.initCanvas(canvasRef.value!.getContext("2d")!);
	});

	function gameEndSpectator(winner : string) {
		gameController.gameRenderer?.endGameForSpectator(winner);
	}

	function spectate(gameExists: boolean) {
		if (!gameExists) {
			router.push("/game")
			return
		}

	}

	function setPlayers(players: GamePlayers) {
		gameController.scoreBoard.user1Name = players.player1
		gameController.scoreBoard.user2Name = players.player2
	}

	function leaveGame() {
		user.socket?.emit("spectate-leave", matchId.value);
		router.push("/game")
	}

</script>

<template>
	<h1>SPECTATING</h1>
	
	<GameBoard>
		<canvas ref="canvasRef" class="pong-board" height="400" width="800"> </canvas>
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
