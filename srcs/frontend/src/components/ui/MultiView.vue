<script setup lang="ts">
	interface Props {
		selected?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		selected: false,
	})
</script>

<template>

	<div class="multiview-container">
		<div class="multiview-header">
			<slot name="tabs"></slot>
		</div>
		<div class="multiview-body">
			<slot name="body"></slot>
		</div>
	</div>

</template>

<style scoped>

	.multiview-container {
		font-family: vp-pixel;
		background-color: #08150C;
		border: 4px solid #4BFE65;
		color: #B3F9D7;
		box-sizing: border-box;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.multiview-header {
		display: flex;
		justify-content: space-between;
	}

	.multiview-body {
		padding: 14px;
		flex: 1;
		overflow-y: auto;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.multiview-body {
			padding: 34px;
			flex: 1;
		}
	}

</style>