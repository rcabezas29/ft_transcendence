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
        <path d="M22 2h-6v6h6V2zM4 4h10v2H4v12h16v-8h2v10H2V4h2zm4 4H6v2h2v2h2v2h4v-2h2v-2h-2v2h-4v-2H8V8z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
