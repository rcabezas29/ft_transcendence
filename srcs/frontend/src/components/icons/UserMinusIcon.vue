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
        <path d="M12 2h6v2h-6v6h-2V4h2V2zm0 8h6v2h-6v-2zm8-6h-2v6h2V4zM9 16H7v6h16v-6h-2v4H9v-4h12v-2H9v2zm-2-6H1v2h6v-2z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
