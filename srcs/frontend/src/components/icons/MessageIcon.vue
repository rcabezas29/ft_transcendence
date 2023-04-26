<script setup lang="ts">
	interface Props {
		w?: number,
		h?: number,
		colour?: string,
	}

	const props = withDefaults(defineProps<Props>(), {
		w: 20,
		h: 20,
		colour: "currentColor",
	})
</script>

<template>
	<svg :width="w" :height="h" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
