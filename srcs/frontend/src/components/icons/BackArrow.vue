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
	<svg :width="w" :height="h" viewBox="0 0 265 265" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M66.6663 0.833374H99.583V33.75H66.6663V0.833374ZM231.25 99.5834V66.6667H66.6663V33.75H33.7497V66.6667H0.833008V99.5834H33.7497V132.5H66.6663V165.417H99.583V132.5H66.6663V99.5834H231.25ZM231.25 231.25V99.5834H264.166V231.25H231.25ZM231.25 231.25V264.167H132.5V231.25H231.25Z" :fill="colour"/>
    </svg>
</template>

<style>
</style>
