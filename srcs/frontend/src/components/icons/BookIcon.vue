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
        <path d="M3 3h8v2H3v12h8V5h2v12h8V5h-8V3h10v16H13v2h-2v-2H1V3h2zm16 7h-4v2h4v-2zm-4-3h4v2h-4V7zm2 6h-2v2h2v-2z"  :fill="colour"/>
    </svg>
</template>

<style>
</style>
