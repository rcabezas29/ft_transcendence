<script setup lang="ts">
</script>

<template>
    <div class="paddle-color-selector">
        <button style="background-color: #D9D9D9;" ></button>
        <button style="background-color: #D64B24;" ></button>
        <button style="background-color: #45D7E7;" ></button>
        <button style="background-color: #8589EA;" ></button>
        <button style="background-color: #EC3F74;" ></button>
        <button style="background-color: #893168;" ></button>
        <button style="background-color: #0A8754;" ></button>
        <button style="background-color: #E7D352;" ></button>
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
    border: 1px solid #4BFE65;
}

</style>