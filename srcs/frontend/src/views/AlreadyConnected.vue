<script setup lang="ts">
import { user } from '@/user';
import router from '@/router';
import Button from '@/components/ui/Button.vue';

function logoutUser(): void {
    user.logout();
    user.alreadyConnected = false;
    router.replace({ "name": "login" });
}
</script>

<template>

<div class="already-connected">
    <h1 style="color: #EC3F74">You are already connected on a different tab</h1>
    <Button @click="logoutUser" v-if="user.checkIsLogged()" class="logout-button">LOGOUT</Button>
</div>

</template>

<style>

.already-connected {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 20%;
}

.logout-button:hover {
    color: #B3F9D7;
    background-color: #1E9052;
}
</style>

