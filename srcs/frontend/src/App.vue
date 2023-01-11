<script setup lang="ts">
	import "./assets/main.css"

	import { user } from "./user";
	import { io } from "socket.io-client";

	user.socket = io("http://10.12.3.5:3000/");



</script>

<template>
		<h1>FT_TRANSCENDENCE</h1>

		<router-view/>
</template>

<style scoped>

</style>