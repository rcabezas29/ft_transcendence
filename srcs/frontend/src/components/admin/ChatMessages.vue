<script setup lang="ts">


</script>

<template>
	<button>Challenge</button>

	<div class="chat-messages">
		<div class="message">
			<div class="chat-message-username">
				pepe:
			</div>
			<div class="chat-message">
				hola que tal
			</div>
		</div>
	</div>
</template>

<style scoped>
	.chat-messages {
		box-sizing: border-box;
		overflow-y: scroll;
		height: 100%;
		width: 100%;
        padding: 0 24px;
	}

	.message {
		display: flex;
	}

	.chat-message-username {
		color: #1E9052;
		margin-right: 10px;
	}

	.chat-message {
		color: #B3F9D7;
		overflow-wrap: anywhere;
	}

	.chat-message-input {
		width: 100%;
	}

	.chat-message-input input {
		box-sizing: border-box;
        font-family: vp-pixel;
		background-color: #08150C;
        color: #B3F9D7;
		border: none;
        border-top: 4px solid #4BFE65;
		width: 100%;
        height: 38px;
        padding: 0 24px;
	}
</style>