<script setup lang="ts">
import { gameController } from "@/gameController";

enum    PaddleColorSelection {
    Gray = "#D9D9D9",
    Orange = "#D64B24",
    Sky = "#45D7E7",
    Violet = "#8589EA",
    Pink = "#EC3F74",
    Burgundy = "#893168",
    Green = "#0A8754",
    Yellow = "#E7D352",
}

function  changePaddleColor(paddleColor : PaddleColorSelection) {
  gameController.paddleColor = paddleColor;
}

</script>

<template>
    <div class="paddle-color-selector">
        <button style="background-color: #D9D9D9;" @click="changePaddleColor(PaddleColorSelection.Gray)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Gray }"></button>
        <button style="background-color: #D64B24;" @click="changePaddleColor(PaddleColorSelection.Orange)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Orange }"></button>
        <button style="background-color: #45D7E7;" @click="changePaddleColor(PaddleColorSelection.Sky)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Sky }"></button>
        <button style="background-color: #8589EA;" @click="changePaddleColor(PaddleColorSelection.Violet)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Violet }"></button>
        <button style="background-color: #EC3F74;" @click="changePaddleColor(PaddleColorSelection.Pink)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Pink }"></button>
        <button style="background-color: #893168;" @click="changePaddleColor(PaddleColorSelection.Burgundy)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Burgundy }"></button>
        <button style="background-color: #0A8754;" @click="changePaddleColor(PaddleColorSelection.Green)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Green }"></button>
        <button style="background-color: #E7D352;" @click="changePaddleColor(PaddleColorSelection.Yellow)" v-bind:class="{ 'selected': gameController.paddleColor === PaddleColorSelection.Yellow }"></button>
    </div>
</template>

<style>
.paddle-color-selector {
    display: flex;
}

.paddle-color-selector > button {
    border: 0px;
    height:50px;
    width:50px;
    cursor:pointer;
    margin-right: 3px;
}

.paddle-color-selector > button:hover {
    border: 2px solid #4BFE65;
}

.selected {
    border: 2px solid #4BFE65 !important;
}

</style>