<script setup lang="ts">

import MultiView from "@/components/ui/MultiView.vue";
import { gameController, GameState } from "@/gameController";
import { onBeforeMount } from "vue";
import PlayingGame from "./PlayingGame.vue";
import SearchGame from "./SearchGame.vue";

onBeforeMount(() => {
  gameController.checkPlayerContinuity();
});

</script>

<template>
  <MultiView>
    <template #body>
      <div class="game-body">
        <SearchGame v-if="gameController.state === GameState.None || gameController.state === GameState.Searching"/>
        <PlayingGame v-if="gameController.state === GameState.Playing || gameController.state === GameState.End"/>
      </div>
    </template>
  </MultiView>
</template>

<style scoped>

.game-body {
  display: flex;
  height: 100%;
}

</style>
