<script setup lang="ts">
	interface Props {
		selected?: boolean,
		bgColor?: string,
		borderColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		selected: false,
		bgColor: "#08150C",
        borderColor: "#4BFE65"
	})
</script>

<template>
	<button :class="{selected: props.selected}">
		<span>
			<slot>
				BUTTON
			</slot>
		</span>
	</button>
</template>

<style scoped>
	button {
		cursor: pointer;
        background-color: v-bind(bgColor);
		border: 4px solid v-bind(borderColor);
		color: #B3F9D7;
		font-family: vp-pixel;
		padding: 20px 60px;
		width: 100%;
		max-height: 66px;
	}

	button:hover,
	.selected {
		background-color: #4BFE65;
		color: #08150C;
	}
</style>