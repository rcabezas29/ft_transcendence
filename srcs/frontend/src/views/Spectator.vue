<script setup lang="ts">
	import { onMounted, ref, type Ref } from 'vue';
	import { useRoute } from 'vue-router';
	import { gameController } from '../gameController';
	import { user } from "../user";
	import router from "../router";
	import Button from '@/components/ui/Button.vue';
	import GameBoard from '@/components/ui/GameBoard.vue';
	import ScoreBoard from '@/components/ScoreBoard.vue';
	import MultiView from "@/components/ui/MultiView.vue";

	interface GamePlayers {
		player1: string;
		player2: string;
	}

	const route = useRoute();
	const matchId: Ref<string> = ref<string>("");
	const canvasRef = ref<HTMLCanvasElement>();

	onMounted(() => {
		const id: string = route.params.matchId as string;
		matchId.value = id;

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
			router.push("/game");
			return;
		}
	}

	function setPlayers(players: GamePlayers) {
		gameController.scoreBoard.user1Name = players.player1;
		gameController.scoreBoard.user2Name = players.player2;
	}

	function leaveGame() {
		user.socket?.emit("spectate-leave", matchId.value);
		router.push("/social");
	}

</script>

<template>
	<MultiView class="multi-view">
		<template #body>
			<div class="container">
				<div class="title">SPECTATING</div>

				<GameBoard class="game-board">
					<canvas ref="canvasRef" class="pong-board" height="400" width="800"> </canvas>
					<ScoreBoard/>
					<Button @click="leaveGame">LEAVE GAME</Button>
				</GameBoard>
			</div>
			
		</template>
	</MultiView>
</template>

<style scoped>

.container {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.multi-view {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.pong-board {
	display: block;
	background-color: black;
}

.title {
  text-align: center;
  margin-top: 1px;
}

</style>
