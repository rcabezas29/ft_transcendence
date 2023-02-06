<script setup lang="ts">

import { gameController } from '@/gameController';

function findGame() {
	gameController.searchGame();
}

</script>

<template>
	<h2>Game</h2>
	<button @click="findGame">Find game</button>

	Status: <span>{{ gameController.state }}</span>
	
	Game: <span>{{ gameController.gameState }}</span>

</template>

<style scoped>

</style>