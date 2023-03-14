<script setup lang="ts">
	import { onMounted, ref, type Ref } from 'vue';
	import { useRoute, type RouteParams } from 'vue-router';
	import router from '../router'

	const route = useRoute();
	const matchId: Ref<string> = ref<string>("");

	onMounted(() => {
		const id: string = route.params.matchId[0];
		matchId.value = id
	})

</script>

<template>
	<h1>Spectator view | Match id: {{ matchId }}</h1>

	<div>
		

	</div>

</template>

<style scoped>

</style>
