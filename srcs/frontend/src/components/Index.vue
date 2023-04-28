<script setup lang="ts">
import router from "@/router";
import { user } from "@/user";

if (!user.checkIsLogged())
	router.replace('/login');

</script>

<template>
	
</template>

<style scoped>

</style>