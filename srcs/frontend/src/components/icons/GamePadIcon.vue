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
        <path d="M2 5h20v14H2V5zm18 12V7H4v10h16zM8 9h2v2h2v2h-2v2H8v-2H6v-2h2V9zm6 0h2v2h-2V9zm4 4h-2v2h2v-2z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
