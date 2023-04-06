<script setup lang="ts">

</script>

<template>

	<div class="multiview-tab">
		<slot/>
	</div>

</template>

<style scoped>
	.multiview-tab {
		cursor: pointer;
		font-size: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-bottom: 4px solid #4BFE65;
		border-left: 4px solid #4BFE65;
		height: 60px;
		width: 100%;
	}

	.multiview-tab:first-child {
		border-left: none;
	}
	
	.multiview-tab:last-child {
		border-right: none;
	}

	.multiview-tab:hover {
		background-color: #4BFE65;
		color: #08150C;
	}

</style>