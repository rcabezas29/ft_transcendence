<script setup lang="ts">
import { gameController } from "@/gameController";
import { onBeforeMount, onMounted, ref } from "vue";
import { GameState } from "@/gameController";
import Button from '@/components/ui/Button.vue';
import ScoreBoard from "@/components/ScoreBoard.vue";
import GameBoard from "@/components/ui/GameBoard.vue";
import router from "../router"

const canvasRef = ref<HTMLCanvasElement>();

onBeforeMount(() => {
  gameController.checkPlayerContinuity();
});
onMounted(() => {
  gameController.initCanvas(canvasRef.value!.getContext("2d")!);
});

function returnToHome() {
	gameController.state = GameState.None;
}

</script>

<template>
    <h3>PONG.EXE</h3>
    
	<GameBoard>
		<canvas ref="canvasRef" class="pong-board" height="400" width="800"> </canvas>
		<ScoreBoard/>

		Status: <span>{{ gameController.state }}</span>
		<Button v-if="gameController.state === GameState.Playing" @click="gameController.endGamePrematurely">STOP GAME</Button>
		<Button v-if="gameController.state === GameState.End" @click="returnToHome">RETURN TO HOME</Button>
	</GameBoard>

</template>

<style scoped>
.pong-board {
  display: block;
  background-color: black;
}


h3 {
  text-align: center;
  margin-top: 1px;
}

</style>