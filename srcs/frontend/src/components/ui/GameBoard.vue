<script setup lang="ts">

</script>

<template>
	<div class="game-board">
		<slot/>
	</div>
</template>

<style scoped>

	.game-board {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	/* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
		.game-board {
			padding: 10%;
			background-image: linear-gradient(0deg, #1e9052 29.17%, #08150c 29.17%, #08150c 50%, #1e9052 50%, #1e9052 79.17%, #08150c 79.17%, #08150c 100%);
			background-size: 24.00px 24.00px;
		}
	}

</style>