<script setup lang="ts">
import { gameController } from '@/gameController';

</script>

<template>
    <div class="score-board">
        <div class="user-score">
            <span>{{ gameController.scoreBoard.user1Name + ": " + gameController.scoreBoard.user1Score }}</span>
        </div>
        <div class="user-score">
            <span>{{ gameController.scoreBoard.user2Name + ": " + gameController.scoreBoard.user2Score }}</span>
        </div>
    </div>
</template>

<style>

.score-board {
    display: flex;
    justify-content: space-between;
}

.user-score {
    width: 49%;
    background-color: #222035;
    color: #B3F9D7;
    text-align: center;
    font-size: 1.5em;
}

</style>
