<script setup lang="ts">

import { gameController, GameState } from "@/gameController";
import { onBeforeMount, onMounted, ref } from "vue";
import Button from '@/components/ui/Button.vue';
import MultiView from "@/components/ui/MultiView.vue";
import type MultiViewTab from "@/components/ui/MultiViewTab.vue";

enum GameSelection {
  Original,
  SuperCool,
  Obstacles,
  Crazy,
}

const canvasRef = ref<HTMLCanvasElement>();

function findGame() {
  gameController.searchGame();
}

function  changeGameSelection(gameSelection : GameSelection) {
  gameController.gameSelection = gameSelection;
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
      <div class="mode-selector" v-if="gameController.state === GameState.None || gameController.state === GameState.Searching">
        <Button @click="changeGameSelection(GameSelection.Original)" :selected="gameController.gameSelection === GameSelection.Original">ORIGINAL</Button>
        <Button @click="changeGameSelection(GameSelection.SuperCool)" :selected="gameController.gameSelection === GameSelection.SuperCool">SUPER COOL</Button>
        <Button @click="changeGameSelection(GameSelection.Obstacles)" :selected="gameController.gameSelection === GameSelection.Obstacles">OBSTACLES</Button>
        <Button @click="changeGameSelection(GameSelection.Crazy)" :selected="gameController.gameSelection === GameSelection.Crazy">CRAZY</Button>
      </div>
      <canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
      <!-- ScoreBoard -->
    </template>
</MultiView>

  Status: <span>{{ gameController.state }}</span>

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

.mode-selector {
  display: flex;
  justify-content: center;
}
</style>
