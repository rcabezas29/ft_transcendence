<script setup lang="ts">
import { gameController } from "@/gameController";
import { onBeforeMount, onMounted, ref } from "vue";
import { GameState } from "@/gameController";
import Button from '@/components/ui/Button.vue';
import ScoreBoard from "@/components/ScoreBoard.vue";

const canvasRef = ref<HTMLCanvasElement>();

onBeforeMount(() => {
  gameController.checkPlayerContinuity();
});
onMounted(() => {
  gameController.initCanvas(canvasRef.value!.getContext("2d")!);
});
</script>

<template>
    <h3>PONG.EXE</h3>
    <div class="game-board">
        <canvas ref="canvasRef" class="pong-board" height="200" width="400"> </canvas>
        <ScoreBoard/>
    
        Status: <span>{{ gameController.state }}</span>
        <Button v-if="gameController.state === GameState.Playing" @click="gameController.endGamePrematurely">STOP GAME</Button>
    </div>
</template>

<style scoped>
.pong-board {
  display: block;
  background-color: black;
}

.game-board {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-image: linear-gradient(0deg, #1e9052 29.17%, #08150c 29.17%, #08150c 50%, #1e9052 50%, #1e9052 79.17%, #08150c 79.17%, #08150c 100%);
    background-size: 24.00px 24.00px;
    padding: 10%;
}

h3 {
  text-align: center;
  margin-top: 1px;
}

</style>