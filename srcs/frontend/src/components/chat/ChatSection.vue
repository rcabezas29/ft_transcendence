<script setup lang="ts">

const props = defineProps({
	sections: null,
	handleClick: null
});

</script>

<template>
	<div class="chat-section">
		<div @click="(e: Event) => props.handleClick(e, section)" v-for="section in props.sections" class="chat-card">
			<div class="chat-card-name">
				{{ section }}
			</div>
			<div class="chat-card-notification chat-card-notification-on">

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