<script setup lang="ts">
	interface Props {
		w?: number,
		h?: number
	}

	const props = withDefaults(defineProps<Props>(), {
		w: 20,
		h: 20
	})
</script>

<template>
	<svg :width="w" :height="h" viewBox="0 0 378 284" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
		<path d="M0.333008 0.5H377.666V47.6667H0.333008V0.5ZM0.333008 118.417H377.666V165.583H0.333008V118.417ZM377.666 236.333H0.333008V283.5H377.666V236.333Z" fill="currentColor"/>
	</svg>
</template>

<style>
</style>