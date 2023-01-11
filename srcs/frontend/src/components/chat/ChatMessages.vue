<setup setup lang="ts">

</setup>

<template>
	<div class="chat-messages-container">
		<div class="chat-container-title">
			Chat title
		</div>
		<div class="chat-message-container">
			<div class="chat-message-username">
				Username
			</div>
			<div class="chat-message">
				Hello how are you
			</div>
		</div>
		<div class="chat-message-container">
			<div class="chat-message-username">
				Username
			</div>
			<div class="chat-message">
				Hello how are you
			</div>
		</div>
	</div>
</template>

<style scoped>
	.chat-messages-container {
		border: 1px solid black;
		margin-left: 10px;
		width: 300px;
	}

	.chat-message-container {
		margin: 4px 0;
	}

	.chat-message-username {
		font-weight: bold;
	}

	.chat-container-title {
		font-weight: bold;
		border-bottom: 5px solid black;
		margin-bottom: 20px;
	}
</style>