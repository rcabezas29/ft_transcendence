<script setup lang="ts">
import Table from "@/components/ui/Table.vue";
import { gameController, GameState } from "@/gameController";
import { onBeforeMount, onMounted, ref } from "vue";
import Button from '@/components/ui/Button.vue';
import MultiView from "@/components/ui/MultiView.vue";
import type MultiViewTab from "@/components/ui/MultiViewTab.vue";

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
  <MultiView class="game-window">
    <template #tabs>
      <MultiViewTab >
        PONG.EXE
      </MultiViewTab>
    </template>
    <template #body>
      <canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
      <!-- ScoreBoard -->
    </template>
</MultiView>

  Status: <span>{{ gameController.state }}</span>

  Time: <span>{{ gameController.timestamp }}</span>


  <Button v-if="gameController.state !== GameState.Playing"  @click="findGame"> SEARCH GAME</Button>
  <Button v-if="gameController.state === GameState.Playing" @click="gameController.endGamePrematurely">STOP GAME</Button>
</template>

<style scoped>
.pong-board {
  display: block;
  background-color: black;
}

.game-window {
  align-items: center;
}
</style>
