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
  <div class="container">
    <div class="title">PONG.EXE</div>

    <GameBoard>
      <canvas ref="canvasRef" class="pong-board" height="400" width="800"> </canvas>
      <ScoreBoard/>

      <Button v-if="gameController.state === GameState.Playing" @click="gameController.endGamePrematurely">STOP GAME</Button>
      <Button v-if="gameController.state === GameState.End" @click="returnToHome">RETURN TO HOME</Button>
    </GameBoard>
  </div>
</template>

<style scoped>
.container {
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