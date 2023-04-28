<script setup lang="ts">

import { ref } from 'vue';
import { gameController, GameState } from "@/gameController";
import Button from '@/components/ui/Button.vue';
import { GameSelection } from "@/interfaces/game-selection";
import PaddleColorSelector from "@/components/PaddleColorSelector.vue";
import Modal from "@/components/ui/Modal.vue";
import RadarAnimation from '../components/ui/RadarAnimation.vue';

function findGame() {
  gameController.searchGame();
}

function  changeGameSelection(gameSelection : GameSelection) {
  gameController.gameSelection = gameSelection;
}

let searchGameModalVisible = ref<boolean>(false);
function openModal() {
  searchGameModalVisible.value = true;
}

function closeModal() {
  searchGameModalVisible.value = false;
  gameController.cancelSearch();
}

</script>

<template>
	<Modal :visible="searchGameModalVisible" @close="closeModal" title="MODAL TITLE">
		<div class="radar-container">
			<RadarAnimation/>
		</div>
		<Button style="width: 100%" @click="closeModal">CANCEL GAME SEARCH</Button>
	</Modal>

  <div class="search-game-box">
    <div class="search-game-customization">
      <h2>GAME MODE</h2>
      <div class="mode-selector" v-if="gameController.state === GameState.None || gameController.state === GameState.Searching">
        <Button @click="changeGameSelection(GameSelection.Original)" :selected="gameController.gameSelection === GameSelection.Original">ORIGINAL</Button>
        <Button @click="changeGameSelection(GameSelection.SuperCool)" :selected="gameController.gameSelection === GameSelection.SuperCool">SUPER COOL</Button>
        <Button @click="changeGameSelection(GameSelection.Crazy)" :selected="gameController.gameSelection === GameSelection.Crazy">CRAZY</Button>
      </div>
      <h2>PADDLE COLOR</h2>
      <PaddleColorSelector/>
    </div>
      <Button v-if="gameController.state !== GameState.Playing"  @click="() => {findGame(); openModal()}">SEARCH GAME</Button>
  </div>

</template>

<style scoped>

.radar-container {
	margin: 24px 0;
}

.search-game-box {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
}

.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media only screen and (min-width: 850px) {

	.mode-selector {
		display: flex;
    flex-direction: row;
		justify-content: space-around;
	}

}

</style>
