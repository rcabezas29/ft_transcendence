<script setup lang="ts">

import { gameController, GameState } from "@/gameController";
import Button from '@/components/ui/Button.vue';
import { GameSelection } from "@/interfaces/game-selection";
import PaddleColorSelector from "@/components/PaddleColorSelector.vue";

interface GameCustomization {
  gameSelection: GameSelection;
  paddleColor: string;
}

function findGame() {
  gameController.searchGame();
}

function  changeGameSelection(gameSelection : GameSelection) {
  gameController.gameSelection = gameSelection;
}

</script>

<template>
    <div class="search-game-box">
        <h2>GAME MODE</h2>
        <div class="mode-selector" v-if="gameController.state === GameState.None || gameController.state === GameState.Searching">
          <Button @click="changeGameSelection(GameSelection.Original)" :selected="gameController.gameSelection === GameSelection.Original">ORIGINAL</Button>
          <Button @click="changeGameSelection(GameSelection.SuperCool)" :selected="gameController.gameSelection === GameSelection.SuperCool">SUPER COOL</Button>
          <Button @click="changeGameSelection(GameSelection.Crazy)" :selected="gameController.gameSelection === GameSelection.Crazy">CRAZY</Button>
        </div>
        <h2>PADDLE COLOR</h2>
        <PaddleColorSelector/>
    
        Status: <span>{{ gameController.state }}</span>
    
        <Button v-if="gameController.state !== GameState.Playing"  @click="findGame">SEARCH GAME</Button>
    </div>
</template>

<style scoped>

@media only screen and (min-width: 850px) {

	.mode-selector {
		display: flex;
		justify-content: space-around;
	}

}

</style>
