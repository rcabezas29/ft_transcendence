<script setup lang="ts">

const props = defineProps({
	title: String
});

</script>

<template>
	<div>

		<div class="chat-divider">
			Friends
		</div>
		<div class="chat-section">

			<div class="chat-card">
				<div class="chat-card-name">
					Username
				</div>
				<div class="chat-card-notification chat-card-notification-on">

				</div>
			</div>

		</div>
	</div>
</template>

<style scoped>

	.chat-section {
		width: 300px;
	}
	
	.chat-card {
		border: 1px solid black;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 30px;
		padding: 10px;
	}

	.chat-card-selected {
		background-color: lightgray;
	}

	.chat-card-notification {
		height:10px;
		width: 10px;
	}

	.chat-card-notification-on {
		background-color: red;
	}

	.chat-divider {
		margin: 15px 0 5px 0;
		font-weight: bold;
	}
</style>