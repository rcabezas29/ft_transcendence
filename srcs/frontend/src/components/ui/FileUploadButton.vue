<script setup lang="ts">
	interface Props {
		bgColor?: string,
		borderColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		bgColor: "#08150C",
        borderColor: "#4BFE65"
	})

    const emit = defineEmits<{
        (e: 'new-file', imageBlob: Blob): void
    }>()

    function loadImage(e: Event) {
        const target = e.target as HTMLInputElement | null;
        if (!target || !target.files)
            return;

        const image: Blob = target.files[0];
        if (!image)
            return;

        emit("new-file", image);
    }

</script>

<template>
    <input type="file" accept="image/jpeg" @change="loadImage"/>
</template>

<style scoped>
    input[type="file"]::file-selector-button {
        cursor: pointer;
        background-color: v-bind(bgColor);
		border: 4px solid v-bind(borderColor);
		color: #B3F9D7;
		font-family: vp-pixel;
		padding: 20px 20px;
		width: 100%;
		max-height: 66px;
    }

    input[type="file"]::file-selector-button:hover {
        background-color: #4BFE65;
		color: #08150C;
    }
</style>
