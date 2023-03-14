<script setup lang="ts">
import { gameController } from "@/gameController";
import { onBeforeMount, onMounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement>();

function findGame() {
  gameController.searchGame();
}

onBeforeMount(() => {
  gameController.checkPlayerContinuity();
})

onMounted(() => {
  gameController.initCanvas(canvasRef.value!.getContext("2d")!);
});
</script>

<template>
  <h2>Game</h2>
  <button v-if="gameController.state !== 'Playing'" @click="findGame">Find game</button>

  Status: <span>{{ gameController.state }}</span>

  Time: <span>{{ gameController.timestamp }}</span>

  <canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
</template>

<style scoped>
.pong-board {
  display: block;
  background-color: black;
}
</style>
