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
        <path d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
